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
  awsSourceBucket,
  gcsSinkBucket,
  awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
) {
  // [START storagetransfer_transfer_from_aws]

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

  // AWS S3 source bucket name
  // awsSourceBucket = 'my-s3-source-bucket'

  // AWS Access Key ID
  // awsAccessKeyId = 'AKIA...'

  // AWS Secret Access Key
  // awsSecretAccessKey = 'HEAoMK2.../...ku8'

  // Google Cloud Storage destination bucket name
  // gcsSinkBucket = 'my-gcs-destination-bucket'

  // Creates a client
  const client = new StorageTransferServiceClient();

  /**
   * Creates a one-time transfer job from Amazon S3 to Google Cloud Storage.
   */
  async function transferFromS3() {
    // Setting the start date and the end date as the same time creates a
    // one-time transfer
    const now = new Date();
    const oneTimeSchedule = {
      day: now.getDate(),
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    };

    // Runs the request and creates the job
    const [transferJob] = await client.createTransferJob({
      transferJob: {
        projectId,
        description,
        status: 'ENABLED',
        schedule: {
          scheduleStartDate: oneTimeSchedule,
          scheduleEndDate: oneTimeSchedule,
        },
        transferSpec: {
          awsS3DataSource: {
            bucketName: awsSourceBucket,
            awsAccessKey: {
              accessKeyId: awsAccessKeyId,
              secretAccessKey: awsSecretAccessKey,
            },
          },
          gcsDataSink: {
            bucketName: gcsSinkBucket,
          },
        },
      },
    });

    console.log(
      `Created and ran a transfer job from '${awsSourceBucket}' to '${gcsSinkBucket}' with name ${transferJob.name}`
    );
  }

  transferFromS3();
  // [END storagetransfer_transfer_from_aws]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
