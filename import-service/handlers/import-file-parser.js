'use strict';

import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import csv from 'csv-parser';

const bucketName = process.env.BUCKET_NAME;
const sqsUrl = process.env.SQS_QUEUE_URL;
const s3Client = new S3Client({ region: process.env.REGION });
const sqsClient = new SQSClient({ region: process.env.REGION });

async function sendProductToSqs(product) {
  const sendMessageParams = {
    QueueUrl: sqsUrl,
    MessageBody: JSON.stringify(product),
  };

  const response = await sqsClient.send(new SendMessageCommand(sendMessageParams));
  console.log(response);
  console.log('Product:', product);
}

export async function importFileParser(event) {
  try {
    const key = event.Records[0].s3.object.key;
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);

    const results = [];

    for await (const row of response.Body.pipe(csv())) {
      results.push(row);
    }

    console.log(sqsUrl);

    results.forEach(row => {
      sendProductToSqs(row);
    });

    const copyParams = {
      Bucket: bucketName,
      CopySource: `${bucketName}/${key}`,
      Key: `${key.replace(process.env.FROM_FOLDER, process.env.TO_FOLDER)}`,
    };

    await s3Client.send(new CopyObjectCommand(copyParams));
    await s3Client.send(new DeleteObjectCommand(params));

  } catch (error) {
    console.error('Error fetching S3 Object:', error);
  }
}