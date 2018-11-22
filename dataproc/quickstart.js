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
async function main() {
  // [START dataproc_quickstart]
  if (
    !process.env.GCLOUD_PROJECT ||
    !process.env.GOOGLE_APPLICATION_CREDENTIALS
  ) {
    throw new Error(
      'Usage: GCLOUD_PROJECT=<project_id> GOOGLE_APPLICATION_CREDENTIALS=<path to json key> node #{$0}'
    );
  }

  const dataproc = require('@google-cloud/dataproc');

  const client = new dataproc.v1.ClusterControllerClient({
    // optional auth parameters.
  });

  const projectId = process.env.GCLOUD_PROJECT;

  // Iterate over all elements.
  const region = 'global';
  const request = {
    projectId: projectId,
    region: region,
  };

  const [resources] = await client.listClusters(request);
  console.log('Total resources:', resources.length);
  for (let i = 0; i < resources.length; i += 1) {
    console.log(resources[i]);
  }

  let nextRequest = request;
  // Or obtain the paged response.
  const options = {autoPaginate: false};
  do {
    const responses = await client.listClusters(nextRequest, options);
    // The actual resources in a response.
    const resources = responses[0];
    // The next request if the response shows that there are more responses.
    nextRequest = responses[1];
    // The actual response object, if necessary.
    // const rawResponse = responses[2];
    for (let i = 0; i < resources.length; i += 1) {
      console.log(resources[i]);
    }
  } while (nextRequest);

  client.listClustersStream(request).on('data', element => {
    console.log(element);
  });
  // [END dataproc_quickstart]
}

main().catch(console.error);
