// Copyright 2020 Google LLC
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

// Submit a Spark job to a Dataproc cluster with the Node.js Client Library.

// sample-metadata:
//   title: Submit Job
//   usage: node submitJob.js <PROJECT_ID> <REGION> <CLUSTER_NAME>

/*eslint no-warning-comments: [0, { "terms": ["todo", "fixme"], "location": "anywhere" }]*/

function main(
  projectId = 'YOUR_PROJECT_ID',
  region = 'YOUR_CLUSTER_REGION',
  clusterName = 'YOUR_CLUSTER_NAME'
) {
  // [START dataproc_submit_job]
  const dataproc = require('@google-cloud/dataproc');
  const {Storage} = require('@google-cloud/storage');

  // TODO(developer): Uncomment and set the following variables
  // projectId = 'YOUR_PROJECT_ID'
  // region = 'YOUR_CLUSTER_REGION'
  // clusterName = 'YOUR_CLUSTER_NAME'

  // Create a client with the endpoint set to the desired cluster region
  const jobClient = new dataproc.v1.JobControllerClient({
    apiEndpoint: `${region}-dataproc.googleapis.com`,
    projectId: projectId,
  });

  async function submitJob() {
    const job = {
      projectId: projectId,
      region: region,
      job: {
        placement: {
          clusterName: clusterName,
        },
        sparkJob: {
          mainClass: 'org.apache.spark.examples.SparkPi',
          jarFileUris: [
            'file:///usr/lib/spark/examples/jars/spark-examples.jar',
          ],
          args: ['1000'],
        },
      },
    };

    const [jobOperation] = await jobClient.submitJobAsOperation(job);
    const [jobResponse] = await jobOperation.promise();

    const matches =
      jobResponse.driverOutputResourceUri.match('gs://(.*?)/(.*)');

    const storage = new Storage();

    const output = await storage
      .bucket(matches[1])
      .file(`${matches[2]}.000000000`)
      .download();

    // Output a success message.
    console.log(`Job finished successfully: ${output}`);
    // [END dataproc_submit_job]
  }

  submitJob();
}

main(...process.argv.slice(2));
