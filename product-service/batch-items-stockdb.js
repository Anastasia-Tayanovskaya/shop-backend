import { fileURLToPath } from 'url';

import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({ region: 'eu-north-1'});

const batchWriteParams = {
  RequestItems: {
    StockDB: [
      {
        PutRequest: {
          Item: {
            product_id: { S: 'eabb973b-e9dd-4c9d-b1ee-50d2f5a6725a' },
            count: { N: '10' },
          }
        },
      },
      {
        PutRequest: {
          Item: {
            product_id: { S: '50fb2328-8b58-4b28-8ee1-8e259b3706f1' },
            count: { N: '7' },
          }
        },
      },
      {
        PutRequest: {
          Item: {
            product_id: { S: '5e5d403c-6101-4335-a400-38939284231b' },
            count: { N: '3' },
          }
        },
      },
      {
        PutRequest: {
          Item: {
            product_id: { S: 'fa57469f-5f0e-4dfe-b0b1-d987a723352f' },
            count: { N: '11' },
          }
        },
      },
    ],
  },
};

console.log('Batch write params for StockDB:', JSON.stringify(batchWriteParams, null, 2));

export const main = async () => {
  const command = new BatchWriteItemCommand(batchWriteParams);

  const response = await client.send(command);
  console.log(response);
  return response;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

