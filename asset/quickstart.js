/**
 * Copyright 2018, Google, Inc.
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

// Imports the Google APIs client library
async function exportAssets (dumpFilePath) {
  // [START asset_quickstart_exportassets]
  const asset = require('@google-cloud/asset');
  var client = new asset.v1beta1.AssetServiceClient({
    // optional auth parameters.
  });

  // Your Google Cloud Platform project ID
  const projectId = process.env.GCLOUD_PROJECT;
  var projectResource = client.projectPath(projectId);

  // var dumpFilePath = 'Dump file path, e.g.: gs://<my_bucket>/<my_asset_file>'
  var outputConfig = {
    gcsDestination: {
      uri: dumpFilePath
    }
  };
  var request = {
    parent: projectResource,
    outputConfig: outputConfig
  };

  // Handle the operation using the promise pattern.
  client.exportAssets(request).then(responses => {
    var operation = responses[0];
    // Operation#promise starts polling for the completion of the operation.
    return operation.promise();
  }).then(responses => {
    // The final result of the operation.
    var result = responses[0];
    // The metadata value of the completed operation.
    // var metadata = responses[1];
    // The response of the api call returning the complete operation.
    // var finalApiResponse = responses[2];
    // Do things with with the response.
    console.log(result);
  })
    .catch(err => {
      console.error(err);
    });
  // [END asset_quickstart_exportassets]
}

const cli = require('yargs')
  .demand(1)
  .command(
    `export-assets <dumpFilePath>`,
    `Export asserts to specified dump file path.`,
    {},
    opts => exportAssets(opts.dumpFilePath)
  )
  .example(
    `node $0 export-assets gs://my-bucket/my-assets.txt`,
    `Export assets to gs://my-bucket/my-assets.txt.`
  )
  .wrap(10)
  .recommendCommands()
  .epilogue(`https://cloud.google.com/resource-manager/docs/cloud-asset-inventory/overview`)
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(1));
}
