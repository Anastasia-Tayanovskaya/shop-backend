'use strict';

import { DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.REGION,
});

const scanProducts = new ScanCommand({
  TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
});
const scanStock = new ScanCommand({
  TableName: process.env.DYNAMODB_STOCK_TABLE,
});

export async function getProductsList() {
  try {
    const productsData = await dynamoDbClient.send(scanProducts);
    const stockData = await dynamoDbClient.send(scanStock);

    const products = productsData.Items.map(item => unmarshall(item));
    const stockResult = stockData.Items.map(item => unmarshall(item));

    const result = products.map(product => {
      const stock = stockResult.find(item => item.product_id === product.id);
      if (stock) {
        product.count = stock.count;
      }
      return product;
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result),
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
