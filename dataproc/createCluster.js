// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Create a Dataproc cluster with the Node.js Client Library.

// sample-metadata:
//   title: Create Cluster
//   usage: node createCluster.js <PROJECT_ID> <REGION> <CLUSTER_NAME>

/*eslint no-warning-comments: [0, { "terms": ["todo", "fixme"], "location": "anywhere" }]*/

function main(
  projectId = 'YOUR_PROJECT_ID',
  region = 'YOUR_CLUSTER_REGION',
  clusterName = 'YOUR_CLUSTER_NAME'
) {
  // [START dataproc_create_cluster]
  const dataproc = require('@google-cloud/dataproc');

  // TODO(developer): Uncomment and set the following variables
  // projectId = 'YOUR_PROJECT_ID'
  // region = 'YOUR_CLUSTER_REGION'
  // clusterName = 'YOUR_CLUSTER_NAME'

  // Create a client with the endpoint set to the desired cluster region
  const client = new dataproc.v1.ClusterControllerClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
    projectId: projectId,
  });

  async function createCluster() {
    // Create the cluster config
    const request = {
      projectId: projectId,
      region: region,
      cluster: {
        clusterName: clusterName,
        config: {
          masterConfig: {
            numInstances: 1,
            machineTypeUri: 'n1-standard-2',
          },
          workerConfig: {
            numInstances: 2,
            machineTypeUri: 'n1-standard-2',
          },
        },
      },
    };

    // Create the cluster
    const [operation] = await client.createCluster(request);
    const [response] = await operation.promise();

    // Output a success message
    console.log(`Cluster created successfully: ${response.clusterName}`);
    // [END dataproc_create_cluster]
  }

  createCluster();
}

main(...process.argv.slice(2));
