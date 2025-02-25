// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// sample-metadata:
//  title: Inspect GCS file with sampling
//  description: Inspects a text file stored on Google Cloud Storage with sampling, using Pub/Sub for job notifications.
//  usage: node inspectGcsFileWithSampling.js.js my-project gcsUri topicId subscriptionId infoTypes
async function main(projectId, gcsUri, topicId, subscriptionId, infoTypes) {
  infoTypes = transformCLI(infoTypes);

  // [START dlp_inspect_gcs_with_sampling]
  // Import the Google Cloud client libraries
  const DLP = require('@google-cloud/dlp');
  const {PubSub} = require('@google-cloud/pubsub');

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new PubSub();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The gcs file path
  // const gcsUri = 'gs://" + "your-bucket-name" + "/path/to/your/file.txt';

  // Specify the type of info the inspection will look for.
  // See https://cloud.google.com/dlp/docs/infotypes-reference for complete list of info types
  // const infoTypes = [{ name: 'PERSON_NAME' }];

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  // DLP Job max time (in milliseconds)
  const DLP_JOB_WAIT_TIME = 15 * 1000 * 60;

  async function inspectGcsFileSampling() {
    // Specify the GCS file to be inspected and sampling configuration
    const storageItemConfig = {
      cloudStorageOptions: {
        fileSet: {url: gcsUri},
        bytesLimitPerFile: 200,
        filesLimitPercent: 90,
        fileTypes: [DLP.protos.google.privacy.dlp.v2.FileType.TEXT_FILE],
        sampleMethod:
          DLP.protos.google.privacy.dlp.v2.CloudStorageOptions.SampleMethod
            .RANDOM_START,
      },
    };

    // Specify how the content should be inspected.
    const inspectConfig = {
      infoTypes: infoTypes,
      minLikelihood: DLP.protos.google.privacy.dlp.v2.Likelihood.POSSIBLE,
      includeQuote: true,
      excludeInfoTypes: true,
    };

    // Specify the action that is triggered when the job completes.
    const actions = [
      {
        pubSub: {
          topic: `projects/${projectId}/topics/${topicId}`,
        },
      },
    ];

    // Create the request for the job configured above.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: inspectConfig,
        storageConfig: storageItemConfig,
        actions: actions,
      },
    };

    // Use the client to send the request.
    const [topicResponse] = await pubsub.topic(topicId).get();

    // Verify the Pub/Sub topic and listen for job notifications via an
    // existing subscription.
    const subscription = await topicResponse.subscription(subscriptionId);

    const [jobsResponse] = await dlp.createDlpJob(request);
    const jobName = jobsResponse.name;
    // Watch the Pub/Sub topic until the DLP job finishes
    await new Promise((resolve, reject) => {
      // Set up the timeout
      const timer = setTimeout(() => {
        reject(new Error('Timeout'));
      }, DLP_JOB_WAIT_TIME);

      const messageHandler = message => {
        if (message.attributes && message.attributes.DlpJobName === jobName) {
          message.ack();
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          clearTimeout(timer);
          resolve(jobName);
        } else {
          message.nack();
        }
      };

      const errorHandler = err => {
        subscription.removeListener('message', messageHandler);
        subscription.removeListener('error', errorHandler);
        clearTimeout(timer);
        reject(err);
      };

      subscription.on('message', messageHandler);
      subscription.on('error', errorHandler);
    });
    const [job] = await dlp.getDlpJob({name: jobName});
    console.log(`Job ${job.name} status: ${job.state}`);

    const infoTypeStats = job.inspectDetails.result.infoTypeStats;
    if (infoTypeStats.length > 0) {
      infoTypeStats.forEach(infoTypeStat => {
        console.log(
          `  Found ${infoTypeStat.count} instance(s) of infoType ${infoTypeStat.infoType.name}.`
        );
      });
    } else {
      console.log('No findings.');
    }
  }

  await inspectGcsFileSampling();
  // [END dlp_inspect_gcs_with_sampling]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

// TODO(developer): Please uncomment below line before running sample
// main(...process.argv.slice(2));

function transformCLI(infoTypes) {
  return infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;
}

export default main;
