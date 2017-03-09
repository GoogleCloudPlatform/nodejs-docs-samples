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
const fs = require('fs');
const requestPromise = require('request-promise');
const mime = require('mime');

// Helper function to poll the rest API using exponential backoff
function pollJob (body, initialTimeout, tries, authToken) {
  const jobName = body.name.split('/')[2];

  // Construct polling function
  const doPoll = (timeout, tries, resolve, reject) => {
    // Construct REST request for polling an inspect job
    const options = {
      url: `${API_URL}/inspect/operations/${jobName}`,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      json: true
    };

    // Poll the inspect job
    setTimeout(() => {
      requestPromise.get(options)
        .then((body) => {
          if (tries <= 0) {
            reject('polling timed out');
          }

          // Job not finished - try again if possible
          if (!(body && body.done)) {
            return doPoll(timeout * 2, tries - 1, resolve, reject);
          }

          // Job finished successfully!
          return resolve(jobName);
        })
        .catch((err) => {
          reject(err);
        });
    }, timeout);
  };

  // Return job-polling REST request as a Promise
  return new Promise((resolve, reject) => {
    doPoll(initialTimeout, tries, resolve, reject);
  });
}

// Helper function to get results of a long-running (polling-required) job
function getJobResults (authToken, jobName) {
  // Construct REST request to get results of finished inspect job
  const options = {
    url: `${API_URL}/inspect/results/${jobName}/findings`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: true
  };

  // Run job-results-fetching REST request
  return requestPromise.get(options);
}

function inspectString (authToken, string, inspectConfig) {
  // [START inspect_string]
  // Your gcloud auth token
  // const authToken = 'YOUR_AUTH_TOKEN';

  // The string to inspect
  // const string = 'My name is Gary and my email is gary@example.com';

  // Construct items to inspect
  const items = [{ type: 'text/plain', value: string }];

  // Construct REST request body
  const requestBody = {
    inspectConfig: {
      infoTypes: inspectConfig.infoTypes,
      minLikelihood: inspectConfig.minLikelihood,
      maxFindings: inspectConfig.maxFindings,
      includeQuote: inspectConfig.includeQuote
    },
    items: items
  };

  // Construct REST request
  const options = {
    url: `${API_URL}/content:inspect`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: requestBody
  };

  // Run REST request
  requestPromise.post(options)
    .then((body) => {
      const results = body.results[0].findings;
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((err) => {
      console.log('Error in inspectString:', err);
    });
  // [END inspect_string]
}

function inspectFile (authToken, filepath, inspectConfig) {
  // [START inspect_file]
  // Your gcloud auth token.
  // const authToken = 'YOUR_AUTH_TOKEN';

  // The path to a local file to inspect. Can be a text, JPG, or PNG file.
  // const fileName = 'path/to/image.png';

  // Construct file data to inspect
  const fileItems = [{
    type: mime.lookup(filepath) || 'application/octet-stream',
    data: new Buffer(fs.readFileSync(filepath)).toString('base64')
  }];

  // Construct REST request body
  const requestBody = {
    inspectConfig: {
      infoTypes: inspectConfig.infoTypes,
      minLikelihood: inspectConfig.minLikelihood,
      maxFindings: inspectConfig.maxFindings,
      includeQuote: inspectConfig.includeQuote
    },
    items: fileItems
  };

  // Construct REST request
  const options = {
    url: `${API_URL}/content:inspect`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: requestBody
  };

  // Run REST request
  requestPromise.post(options)
    .then((body) => {
      const results = body.results[0].findings;
      console.log(JSON.stringify(results, null, 2));
    })
    .catch((err) => {
      console.log('Error in inspectFile:', err);
    });
  // [END inspect_file]
}

function inspectGCSFile (authToken, bucketName, fileName, inspectConfig) {
  // [START inspect_gcs_file]
  // Your gcloud auth token.
  // const authToken = 'YOUR_AUTH_TOKEN';

  // The name of the bucket where the file resides.
  // const bucketName = 'YOUR-BUCKET';

  // The path to the file within the bucket to inspect.
  // Can contain wildcards, e.g. "my-image.*"
  // const fileName = 'my-image.png';

  // Get reference to the file to be inspected
  const storageItems = {
    cloudStorageOptions: {
      fileSet: { url: `gs://${bucketName}/${fileName}` }
    }
  };

  // Construct REST request body for creating an inspect job
  const requestBody = {
    inspectConfig: {
      infoTypes: inspectConfig.infoTypes,
      minLikelihood: inspectConfig.minLikelihood,
      maxFindings: inspectConfig.maxFindings
    },
    storageConfig: storageItems
  };

  // Construct REST request for creating an inspect job
  let options = {
    url: `${API_URL}/inspect/operations`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: requestBody
  };

  // Run inspect-job creation REST request
  requestPromise.post(options)
    .then((createBody) => pollJob(createBody, inspectConfig.initialTimeout, inspectConfig.tries, authToken))
    .then((jobName) => getJobResults(authToken, jobName))
    .then((findingsBody) => {
      const findings = findingsBody.result.findings;
      console.log(JSON.stringify(findings, null, 2));
    })
    .catch((err) => {
      console.log('Error in inspectGCSFile:', err);
    });
  // [END inspect_gcs_file]
}

function inspectDatastore (authToken, namespaceId, kind, inspectConfig) {
  // [START inspect_datastore]
  // Your gcloud auth token
  // const authToken = 'YOUR_AUTH_TOKEN';

  // (Optional) The ID namespace of the Datastore document to inspect.
  // To ignore Datastore namespaces, set this to an empty string ('')
  // const namespace = '';

  // The kind of the Datastore entity to inspect.
  // const kind = 'Person';

  // Get reference to the file to be inspected
  const storageItems = {
    datastoreOptions: {
      partitionId: {
        projectId: inspectConfig.projectId,
        namespaceId: namespaceId
      },
      kind: {
        name: kind
      }
    }
  };

  // Construct REST request body for creating an inspect job
  const requestBody = {
    inspectConfig: {
      infoTypes: inspectConfig.infoTypes,
      minLikelihood: inspectConfig.minLikelihood,
      maxFindings: inspectConfig.maxFindings
    },
    storageConfig: storageItems
  };

  // Construct REST request for creating an inspect job
  let options = {
    url: `${API_URL}/inspect/operations`,
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json'
    },
    json: requestBody
  };

  // Run inspect-job creation REST request
  requestPromise.post(options)
    .then((createBody) => pollJob(createBody, inspectConfig.initialTimeout, inspectConfig.tries, authToken))
    .then((jobName) => getJobResults(authToken, jobName))
    .then((findingsBody) => {
      const findings = findingsBody.result.findings;
      console.log(JSON.stringify(findings, null, 2));
    })
    .catch((err) => {
      console.log('Error in inspectDatastore:', err);
    });
  // [END inspect_datastore]
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
        `string <string>`,
        `Inspect a string using the Data Loss Prevention API.`,
        {},
        (opts) => inspectString(opts.authToken, opts.string, opts)
      )
      .command(
        `file <filepath>`,
        `Inspects a local text, PNG, or JPEG file using the Data Loss Prevention API.`,
        {},
        (opts) => inspectFile(opts.authToken, opts.filepath, opts)
      )
      .command(
        `gcsFile <bucketName> <fileName>`,
        `Inspects a text file stored on Google Cloud Storage using the Data Loss Prevention API.`,
      {
        initialTimeout: {
          type: 'integer',
          alias: '-i',
          default: 5000
        },
        tries: {
          type: 'integer',
          default: 5
        }
      },
        (opts) => inspectGCSFile(opts.authToken, opts.bucketName, opts.fileName, opts)
      )
      .command(
        `datastore <kind>`,
        `Inspect a Datastore instance using the Data Loss Prevention API.`,
      {
        projectId: {
          type: 'string',
          default: process.env.GCLOUD_PROJECT
        },
        namespaceId: {
          type: 'string',
          default: ''
        },
        initialTimeout: {
          type: 'integer',
          alias: '-i',
          default: 5000
        },
        tries: {
          type: 'integer',
          default: 5
        }
      },
        (opts) => inspectDatastore(opts.authToken, opts.namespaceId, opts.kind, opts)
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
      .option('f', {
        alias: 'maxFindings',
        default: 0,
        type: 'integer',
        global: true
      })
      .option('q', {
        alias: 'includeQuote',
        default: true,
        type: 'boolean',
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
        default: [],
        type: 'array',
        global: true,
        coerce: (infoTypes) => infoTypes.map((type) => {
          return { name: type };
        })
      })
      .example(`node $0 string "My phone number is (123) 456-7890 and my email address is me@somedomain.com"`)
      .example(`node $0 file resources/test.txt`)
      .example(`node $0 gcsFile my-bucket my-file.txt`)
      .wrap(120)
      .recommendCommands()
      .epilogue(`For more information, see https://cloud.google.com/dlp/docs. Optional flags are explained at https://cloud.google.com/dlp/docs/reference/rest/v2beta1/content/inspect#InspectConfig`);

    cli.help().strict().argv;
  });
}
