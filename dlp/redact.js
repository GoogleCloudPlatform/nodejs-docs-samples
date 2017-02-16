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

function redactString (authToken, string, replaceString, inspectConfig) {
  // [START redact_string]
  // Your gcloud auth token
  // const authToken = 'YOUR_AUTH_TOKEN';

  // The string to inspect
  // const string = 'My name is Gary and my email is gary@example.com';

  // The string to replace sensitive data with
  // const replaceString = 'REDACTED';

  // Construct items to inspect
  const items = [{ type: 'text/plain', value: string }];

  // Construct info types + replacement configs
  const replaceConfigs = inspectConfig.infoTypes.map((infoType) => {
    return {
      infoType: infoType,
      replaceWith: replaceString
    };
  });

  // Construct REST request body
  const requestBody = {
    inspectConfig: {
      infoTypes: inspectConfig.infoTypes,
      minLikelihood: inspectConfig.minLikelihood
    },
    items: items,
    replaceConfigs: replaceConfigs
  };

  // Construct REST request
  const options = {
    url: `${API_URL}/content:redact`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: requestBody
  };

  // Run REST request
  requestPromise.post(options)
    .then((body) => {
      const results = body.items[0].value;
      console.log(results);
    })
    .catch((err) => {
      console.log('Error in redactString:', err);
    });
  // [END redact_string]
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
        `string <string> <replaceString>`,
        `Redact sensitive data from a string using the Data Loss Prevention API.`,
        {},
        (opts) => redactString(opts.authToken, opts.string, opts.replaceString, opts)
      )
      .option('m', {
        alias: 'minLikelihood',
        default: 'LIKELIHOOD_UNSPECIFIED',
        type: 'string',
        choices: [
          'LIKELIHOOD_UNSPECIFIED',
          'VERY_UNLIKELY',
          'UNLIKELY',
          'POSSIBLE',
          'LIKELY',
          'VERY_LIKELY'
        ],
        global: true
      })
      .option('a', {
        alias: 'authToken',
        default: token,
        type: 'string',
        global: true
      })
      .option('t', {
        alias: 'infoTypes',
        required: true,
        type: 'array',
        global: true,
        coerce: (infoTypes) => infoTypes.map((type) => {
          return { name: type };
        })
      })
      .example(`node $0 string "My name is Gary" "REDACTED" -t US_MALE_NAME`)
      .wrap(120)
      .recommendCommands()
      .epilogue(`For more information, see https://cloud.google.com/dlp/docs. Optional flags are explained at https://cloud.google.com/dlp/docs/reference/rest/v2beta1/content/inspect#InspectConfig`);

    cli.help().strict().argv;
  });
}
