/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const API_URL = 'https://dlp.googleapis.com/v2beta1';
const requestPromise = require('request-promise');

function listInfoTypes (authToken, category) {
  // [START list_info_types]
  // Your gcloud auth token.
  // const authToken = 'YOUR_AUTH_TOKEN';

  // The category of info types to list.
  // const category = 'CATEGORY_TO_LIST';

  // Construct REST request
  const options = {
    url: `${API_URL}/rootCategories/${category}/infoTypes`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: true
  };

  // Run REST request
  requestPromise.get(options)
    .then((body) => {
      console.log(body);
    })
    .catch((err) => {
      console.log('Error in listInfoTypes:', err);
    });
  // [END list_info_types]
}

function listCategories (authToken) {
  // [START list_categories]
  // Your gcloud auth token.
  // const authToken = 'YOUR_AUTH_TOKEN';

  // Construct REST request
  const options = {
    url: `${API_URL}/rootCategories`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: true
  };

  // Run REST request
  requestPromise.get(options)
    .then((body) => {
      const categories = body.categories;
      console.log(categories);
    })
    .catch((err) => {
      console.log('Error in listCategories:', err);
    });
  // [END list_categories]
}

if (module === require.main) {
  const auth = require('google-auto-auth')({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });
  auth.getToken((err, token) => {
    if (err) {
      console.err('Error fetching auth token:', err);
      process.exit(1);
    }

    const cli = require(`yargs`)
      .demand(1)
      .command(
        `infoTypes <category>`,
        `List types of sensitive information within a category.`,
        {},
        (opts) => listInfoTypes(opts.authToken, opts.category)
      )
      .command(
        `categories`,
        `List root categories of sensitive information.`,
        {},
        (opts) => listCategories(opts.authToken)
      )
      .option('a', {
        alias: 'authToken',
        default: token,
        type: 'string',
        global: true
      })
      .example(`node $0 infoTypes GOVERNMENT`)
      .example(`node $0 categories`)
      .wrap(120)
      .recommendCommands()
      .epilogue(`For more information, see https://cloud.google.com/dlp/docs`);

    cli.help().strict().argv; // eslint-disable-line
  });
}
