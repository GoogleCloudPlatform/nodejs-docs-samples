/**
 * Copyright 2022 Google LLC
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

async function main(
  projectId,
  description,
  gcsSourceBucket,
  gcsSinkBucket,
  startDate = new Date()
) {
  // [START storagetransfer_transfer_to_nearline]

  // Imports the Google Cloud client library
  const {
    StorageTransferServiceClient,
  } = require('@google-cloud/storage-transfer');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of the Google Cloud Platform Project that owns the job
  // projectId = 'my-project-id'

  // A useful description for your transfer job
  // description = 'My transfer job'

  // Google Cloud Storage source bucket name
  // gcsSourceBucket = 'my-gcs-source-bucket'

  // Google Cloud Storage destination bucket name
  // gcsSinkBucket = 'my-gcs-destination-bucket'

  // Date to start daily migration
  // startDate = new Date()

  // Creates a client
  const client = new StorageTransferServiceClient();

  /**
   * Create a daily migration from a GCS bucket to another GCS bucket for
   * objects untouched for 30+ days.
   */
  async function createDailyNearline30DayMigration() {
    // Runs the request and creates the job
    const [transferJob] = await client.createTransferJob({
      transferJob: {
        projectId,
        description,
        status: 'ENABLED',
        schedule: {
          scheduleStartDate: {
            day: startDate.getDate(),
            month: startDate.getMonth() + 1,
            year: startDate.getFullYear(),
          },
        },
        transferSpec: {
          gcsDataSource: {
            bucketName: gcsSourceBucket,
          },
          gcsDataSink: {
            bucketName: gcsSinkBucket,
          },
          objectConditions: {
            minTimeElapsedSinceLastModification: {
              seconds: 2592000, // 30 days
            },
          },
          transferOptions: {
            deleteObjectsFromSourceAfterTransfer: true,
          },
        },
      },
    });

    console.log(`Created transferJob: ${transferJob.name}`);
  }

  createDailyNearline30DayMigration();
  // [END storagetransfer_transfer_to_nearline]
}

const [projectId, description, gcsSourceBucket, gcsSinkBucket, startDate] = [
  ...process.argv.slice(2),
];

main(
  projectId,
  description,
  gcsSourceBucket,
  gcsSinkBucket,
  new Date(startDate)
);

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
