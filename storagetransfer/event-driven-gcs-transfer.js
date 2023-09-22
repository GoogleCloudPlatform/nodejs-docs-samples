/**
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(projectId, gcsSourceBucket, gcsSinkBucket, pubsubId) {
  // [START storagetransfer_create_event_driven_gcs_transfer]

  // Imports the Google Cloud client library
  const {
    StorageTransferServiceClient,
  } = require('@google-cloud/storage-transfer');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of the Google Cloud Platform Project that owns the job
  // projectId = 'my-project-id'

  // Google Cloud Storage source bucket name
  // gcsSourceBucket = 'my-gcs-source-bucket'

  // Google Cloud Storage destination bucket name
  // gcsSinkBucket = 'my-gcs-destination-bucket'

  // The subscription ID to a Pubsub queue to track
  // pubsubId = 'projects/PROJECT_NAME/subscriptions/SUBSCRIPTION_ID'

  // Creates a client
  const client = new StorageTransferServiceClient();

  /**
   * Creates an event driven transfer that tracks a Pubsub subscription.
   */
  async function createEventDrivenGcsTransfer() {
    const [transferJob] = await client.createTransferJob({
      transferJob: {
        projectId,
        status: 'ENABLED',
        transferSpec: {
          gcsDataSource: {
            bucketName: gcsSourceBucket,
          },
          gcsDataSink: {
            bucketName: gcsSinkBucket,
          },
        },
        eventStream: {
          name: pubsubId,
        },
      },
    });

    console.log(
      `Created an event driven transfer from '${gcsSourceBucket}' to '${gcsSinkBucket}' with name ${transferJob.name}`
    );
  }

  createEventDrivenGcsTransfer();
  // [END storagetransfer_create_event_driven_gcs_transfer]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
