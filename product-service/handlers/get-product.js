'use strict';

import products from '../mocks/products.js';

export async function getProductsById(event) {
  const productId = event.pathParameters.productId;
  const product = products.find(item => item.id === productId);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(product),
  };
}