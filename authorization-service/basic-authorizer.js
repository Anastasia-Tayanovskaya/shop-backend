'use strict';

export async function basicAuthorizer(event, context, callback) {
  console.log('Event: ', JSON.stringify(event));
  console.log('Context: ', context);
  if (event['type'] !== 'TOKEN') {
    callback('Unauthorized');
  }

  try {
    const authorizationToken = event.authorizationToken;

    const encodedCreds = authorizationToken.split(' ')[1];
    const buff = Buffer.from(encodedCreds, 'base64');
    const plainCreds = buff.toString('utf-8').split(':');
    const username = plainCreds[0];
    const password = plainCreds[1];

    console.log(`Username: ${username} and password: ${password}`);

    const storedUserPassword = process.env[username];

    const effect = !storedUserPassword || storedUserPassword !== password ? 'Deny' : 'Allow';

    console.log('Effect: ', effect);

    const policy = generatePolicy(encodedCreds, event.methodArn, effect);

    callback(null, policy);
  }
  catch (error) {
    callback( `Unauthorized: ${error.message}`);
  }
};

const generatePolicy = (principalId, resource, effect = 'Allow') => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource,
      }],
    },
  };
}
