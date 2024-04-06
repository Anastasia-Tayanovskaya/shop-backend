'use strict';

import { PutItemCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.REGION,
});

const productParams = {
  TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
}

const stockParams = {
  TableName: process.env.DYNAMODB_STOCK_TABLE,
}

export async function createProduct(event) {
  try {
    console.log('EVENT: \n', event);
    const {description, title, price, count } = JSON.parse(event.body);
    console.log(description, title, price, count)

    if (!description || typeof description !== 'string' ||
      !title || typeof title !== 'string' ||
      !price || isNaN(price) || price <= 0 ||
      isNaN(count) || count < 0) {
        return {
          statusCode: 400,
          headers: {
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ error: 'Invalid request data' }),
        }
    }

    const newProductId = uuidv4();

    productParams.Item = {
      id: { S: newProductId },
      title: { S: title },
      description: { S: description },
      price: { N: price.toString() },
    };

    stockParams.Item = {
      product_id: { S: newProductId },
      count: { N: count.toString() },
    };

    const putProductCommand = new PutItemCommand(productParams);
    const putProductCountCommand = new PutItemCommand(stockParams);

    const productsResponse = await dynamoDbClient.send(putProductCommand);
    const stockResponse = await dynamoDbClient.send(putProductCountCommand);
    console.log(productsResponse, stockResponse);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        id: newProductId,
        description,
        title,
        price,
        count,
      }),
    };
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