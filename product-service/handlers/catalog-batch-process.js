'use strict';

import { PublishCommand, SetTopicAttributesCommand } from '@aws-sdk/client-sns';
import { SNSClient } from '@aws-sdk/client-sns';
import { TransactWriteItemsCommand, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';

export const snsClient = new SNSClient({ region: process.env.REGION });
const client = new DynamoDBClient({ region: process.env.REGION });

export async function catalogBatchProcess(event) {

  const putProductsList = [];
  const putStockList = [];
  try {
    event.Records.forEach(async product => {
      const newProductId = uuidv4();
      const {description, title, price, count } = JSON.parse(product.body);
      console.log(description, ',', title, ',', price, ',', count)
      putProductsList.push({
        Put: {
          TableName: process.env.DYNAMODB_PRODUCTS_TABLE,
          Item: {
            id: { S: newProductId },
            title: { S: title },
            description: { S: description },
            price: { N: price.toString() },
          },
          ConditionExpression: 'attribute_not_exists(id)',
        }
      });

      putStockList.push({
        Put: {
          TableName: process.env.DYNAMODB_STOCK_TABLE,
          Item: {
            product_id: { S: newProductId },
            count: { N: count.toString() },
          },

          ConditionExpression: 'attribute_not_exists(product_id)',
        }
      });

    });

    const transactionParams = {
      TransactItems: [...putProductsList, ...putStockList],
    };

    await client.send(new TransactWriteItemsCommand(transactionParams));

    const snsTopicParams = {
      Subject: 'Notification from Create Batch Products',
      Message: 'New portion of products was created',
      TopicArn: process.env.SNS_TOPIC_ARN,
    };

    const notificationData = await snsClient.send(new PublishCommand(snsTopicParams));
    console.log('Message published to SNS: ', notificationData.MessageId);


  } catch (error) {
    console.log('Error at Catalog Butch Process:', error);
  }
}