'use strict';

import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import csv from 'csv-parser';

const bucketName = process.env.BUCKET_NAME;
const s3Client = new S3Client({ region: process.env.REGION });

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

    results.forEach(row => console.log('Row:', row));

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