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

async function main(
  projectId,
  s3SourceBucket,
  gcsSinkBucket,
  sqsQueueArn,
  awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
) {
  // [START storagetransfer_create_event_driven_aws_transfer]

  // Imports the Google Cloud client library
  const {
    StorageTransferServiceClient,
  } = require('@google-cloud/storage-transfer');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of the Google Cloud Platform Project that owns the job
  // projectId = 'my-project-id'

  // AWS S3 source bucket name
  // s3SourceBucket = 'my-s3-source-bucket'

  // Google Cloud Storage destination bucket name
  // gcsSinkBucket = 'my-gcs-destination-bucket'

  // The ARN of the SQS queue to subscribe to
  // sqsQueueArn = 'arn:aws:sqs:us-east-1:1234567891011:s3-notification-queue'

  // AWS Access Key ID. Should be accessed via environment variable for security.
  // awsAccessKeyId = 'AKIA...'

  // AWS Secret Access Key. Should be accessed via environment variable for security.
  // awsSecretAccessKey = 'HEAoMK2.../...ku8'

  // Creates a client
  const client = new StorageTransferServiceClient();

  /**
   * Creates an event driven transfer that tracks an SQS queue.
   */
  async function createEventDrivenAwsTransfer() {
    const [transferJob] = await client.createTransferJob({
      transferJob: {
        projectId,
        status: 'ENABLED',
        transferSpec: {
          awsS3DataSource: {
            bucketName: s3SourceBucket,
            awsAccessKey: {
              accessKeyId: awsAccessKeyId,
              secretAccessKey: awsSecretAccessKey,
            },
          },
          gcsDataSink: {
            bucketName: gcsSinkBucket,
          },
        },
        eventStream: {
          name: sqsQueueArn,
        },
      },
    });

    console.log(
      `Created an event driven transfer from '${s3SourceBucket}' to '${gcsSinkBucket}' with name ${transferJob.name}`
    );
  }

  createEventDrivenAwsTransfer();
  // [END storagetransfer_create_event_driven_aws_transfer]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err);
  process.exitCode = 1;
});
