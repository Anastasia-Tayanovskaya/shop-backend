'use strict';

import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const bucketName = process.env.BUCKET_NAME;
const s3Client = new S3Client({ region: process.env.REGION });

export async function importProductsFile(event) {
  const { queryStringParameters } = event;

  try {
    const { name } = queryStringParameters || {};
    const fileName = name;
    console.log(fileName);

    if (!fileName) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: 'No file name provided',
      };
    }

    const bucketParams = {
      Bucket: bucketName,
      Key: `uploaded/${fileName}`,
      ContentType: 'text/csv',
    };

    const command = new PutObjectCommand(bucketParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    console.log(signedUrl);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: signedUrl,
    };

  } catch (error) {
    console.log(error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(error),
    };
  }
};
