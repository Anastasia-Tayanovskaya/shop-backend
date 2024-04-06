import { fileURLToPath } from 'url';

import {
  BatchWriteItemCommand,
  DynamoDBClient,
} from '@aws-sdk/client-dynamodb';

import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({ region: 'eu-north-1'});

const batchWriteParams = {
  RequestItems: {
    ProductsDB: [
      {
        PutRequest: {
          Item: {
            id: { S: uuidv4() },
            title: { S: 'Forest Animals: Red Fox' },
            description: { S: 'Lego Category: Creator 3-in-1' },
            price: { N: '49.99' },
          }
        },
      },
      {
        PutRequest: {
          Item: {
            id: { S: uuidv4() },
            title: { S: 'Passenger Airplane' },
            description: { S: 'Lego Category: City' },
            price: { N: '199.99' },
          }
        },
      },
      {
        PutRequest: {
          Item: {
            id: { S: uuidv4() },
            title: { S: 'Lots of Bricks' },
            description: { S: 'Lego Category: Classic' },
            price: { N: '59.99' },
          }
        },
      },
      {
        PutRequest: {
          Item: {
            id: { S: uuidv4() },
            title: { S: 'Velociraptor Escape' },
            description: { S: 'Lego Category: Jurassic World' },
            price: { N: '39.99' },
          }
        },
      },
    ],
  },
};

console.log('Batch write params:', JSON.stringify(batchWriteParams, null, 2));

export const main = async () => {
  const command = new BatchWriteItemCommand(batchWriteParams);

  const response = await client.send(command);
  console.log(response);
  return response;
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}

