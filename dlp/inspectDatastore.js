// Copyright 2020 Google LLC
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

'use strict';

// sample-metadata:
//  title: Inspect Datastore
//  description: Inspect a Datastore instance using the Data Loss Prevention API using Pub/Sub for job notifications.
//  usage: node inspectDatastore.js my-project dataProjectId namespaceId kind topicId subscriptionId minLikelihood maxFindings infoTypes customInfoTypes

function main(
  projectId,
  dataProjectId,
  namespaceId,
  kind,
  topicId,
  subscriptionId,
  minLikelihood,
  maxFindings,
  infoTypes,
  customInfoTypes
) {
  [infoTypes, customInfoTypes] = transformCLI(infoTypes, customInfoTypes);

  // [START dlp_inspect_datastore]
  // Import the Google Cloud client libraries
  const DLP = require('@google-cloud/dlp');
  const {PubSub} = require('@google-cloud/pubsub');

  // Instantiates clients
  const dlp = new DLP.DlpServiceClient();
  const pubsub = new PubSub();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The project ID the target Datastore is stored under
  // This may or may not equal the calling project ID
  // const dataProjectId = 'my-project';

  // (Optional) The ID namespace of the Datastore document to inspect.
  // To ignore Datastore namespaces, set this to an empty string ('')
  // const namespaceId = '';

  // The kind of the Datastore entity to inspect.
  // const kind = 'Person';

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // The customInfoTypes of information to match
  // const customInfoTypes = [{ infoType: { name: 'DICT_TYPE' }, dictionary: { wordList: { words: ['foo', 'bar', 'baz']}}},
  //   { infoType: { name: 'REGEX_TYPE' }, regex: {pattern: '\\(\\d{3}\\) \\d{3}-\\d{4}'}}];

  // The name of the Pub/Sub topic to notify once the job completes
  // TODO(developer): create a Pub/Sub topic to use for this
  // const topicId = 'MY-PUBSUB-TOPIC'

  // The name of the Pub/Sub subscription to use when listening for job
  // completion notifications
  // TODO(developer): create a Pub/Sub subscription to use for this
  // const subscriptionId = 'MY-PUBSUB-SUBSCRIPTION'

  async function inspectDatastore() {
    // Construct items to be inspected
    const storageItems = {
      datastoreOptions: {
        partitionId: {
          projectId: dataProjectId,
          namespaceId: namespaceId,
        },
        kind: {
          name: kind,
        },
      },
    };

    // Construct request for creating an inspect job
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectJob: {
        inspectConfig: {
          infoTypes: infoTypes,
          customInfoTypes: customInfoTypes,
          minLikelihood: minLikelihood,
          limits: {
            maxFindingsPerRequest: maxFindings,
          },
        },
        storageConfig: storageItems,
        actions: [
          {
            pubSub: {
              topic: `projects/${projectId}/topics/${topicId}`,
            },
          },
        ],
      },
    };
    // Run inspect-job creation request
    const [topicResponse] = await pubsub.topic(topicId).get();
    // Verify the Pub/Sub topic and listen for job notifications via an
    // existing subscription.
    const subscription = await topicResponse.subscription(subscriptionId);
    const [jobsResponse] = await dlp.createDlpJob(request);
    const jobName = jobsResponse.name;
    // Watch the Pub/Sub topic until the DLP job finishes
    await new Promise((resolve, reject) => {
      const messageHandler = message => {
        if (message.attributes && message.attributes.DlpJobName === jobName) {
          message.ack();
          subscription.removeListener('message', messageHandler);
          subscription.removeListener('error', errorHandler);
          resolve(jobName);
        } else {
          message.nack();
        }
      };

      const errorHandler = err => {
        subscription.removeListener('message', messageHandler);
        subscription.removeListener('error', errorHandler);
        reject(err);
      };

      subscription.on('message', messageHandler);
      subscription.on('error', errorHandler);
    });
    // Wait for DLP job to fully complete
    setTimeout(() => {
      console.log('Waiting for DLP job to fully complete');
    }, 500);
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
  inspectDatastore();
  // [END dlp_inspect_datastore]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

function transformCLI(infoTypes, customInfoTypes) {
  infoTypes = infoTypes
    ? infoTypes.split(',').map(type => {
        return {name: type};
      })
    : undefined;

  if (customInfoTypes) {
    customInfoTypes = customInfoTypes.includes(',')
      ? customInfoTypes.split(',').map((dict, idx) => {
          return {
            infoType: {name: 'CUSTOM_DICT_'.concat(idx.toString())},
            dictionary: {wordList: {words: dict.split(',')}},
          };
        })
      : customInfoTypes.split(',').map((rgx, idx) => {
          return {
            infoType: {name: 'CUSTOM_REGEX_'.concat(idx.toString())},
            regex: {pattern: rgx},
          };
        });
  }

  return [infoTypes, customInfoTypes];
}
