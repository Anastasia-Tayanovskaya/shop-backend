'use strict';

import products from '../mocks/products.js';

export async function getProductsList(event) {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify(products),
  };
}
