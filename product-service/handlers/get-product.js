'use strict';

import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.REGION,
});

const productsParams = {
  TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
  KeyConditionExpression: 'id = :id',
};

const stockParams = {
  TableName: process.env.DYNAMODB_STOCK_TABLE,
  KeyConditionExpression: 'product_id = :product_id',
}

export async function getProductsById(event) {
  try {
    console.log('EVENT: \n', event);
    productsParams.ExpressionAttributeValues = {
      ':id': { S: event.pathParameters.productId },
    };

    stockParams.ExpressionAttributeValues = {
      ':product_id': { S: event.pathParameters.productId },
    };

    const queryProducts = new QueryCommand(productsParams);
    const queryStock = new QueryCommand(stockParams);

    const product = unmarshall((await dynamoDbClient.send(queryProducts)).Items[0]);
    const productInStock = unmarshall((await dynamoDbClient.send(queryStock)).Items[0]);

    console.log(productInStock);

    const response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ product: { ...product, count: productInStock.count }}),
    }
    return response;
  } catch (error) {
    console.log('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Internal server error'}),
    }
  }
}