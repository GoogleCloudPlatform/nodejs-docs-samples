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

const {protos} = require('@google-cloud/storage-transfer');
const {AuthMethod, NetworkProtocol, RequestModel} =
  protos.google.storagetransfer.v1.S3CompatibleMetadata;

async function main(
  projectId = 'my-project',
  sourceAgentPoolName = 'projects/my-project/agentPools/transfer_service_default',
  sourceBucketName = 'my-bucket-name',
  sourcePath = 'path/to/data/',
  gcsSinkBucket = 'my-sink-bucket',
  gcsPath = 'path/to/data/',
  region = 'us-east-1',
  endpoint = 'us-east-1.example.com',
  protocol = NetworkProtocol.NETWORK_PROTOCOL_HTTPS,
  requestModel = RequestModel.REQUEST_MODEL_VIRTUAL_HOSTED_STYLE,
  authMethod = AuthMethod.AUTH_METHOD_AWS_SIGNATURE_V4
) {
  // [START storagetransfer_transfer_from_s3_compatible_source]

  // Imports the Google Cloud client library
  const storageTransfer = require('@google-cloud/storage-transfer');

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // Useful enums for AWS S3-Compatible Transfers
  // const {AuthMethod, NetworkProtocol, RequestModel} = storageTransfer.protos.google.storagetransfer.v1.S3CompatibleMetadata;

  // Your project id
  // const projectId = 'my-project';

  // The agent pool associated with the S3-compatible data source. Defaults to the default agent
  // const sourceAgentPoolName = 'projects/my-project/agentPools/transfer_service_default';

  // The S3-compatible bucket name to transfer data from
  // const sourceBucketName = "my-bucket-name";

  // The S3-compatible path (object prefix) to transfer data from
  // const sourcePath = "path/to/data/";

  // The ID of the GCS bucket to transfer data to
  // const gcsSinkBucket = "my-sink-bucket";

  // The GCS path (object prefix) to transfer data to
  // const gcsPath = "path/to/data/";

  // The S3 region of the source bucket
  // const region = 'us-east-1';

  // The S3-compatible endpoint
  // const endpoint = "us-east-1.example.com";

  // The S3-compatible network protocol
  // const protocol = NetworkProtocol.NETWORK_PROTOCOL_HTTPS;

  // The S3-compatible request model
  // const requestModel = RequestModel.REQUEST_MODEL_VIRTUAL_HOSTED_STYLE;

  // The S3-compatible auth method
  // const authMethod = AuthMethod.AUTH_METHOD_AWS_SIGNATURE_V4;

  // Creates a client
  const client = new storageTransfer.StorageTransferServiceClient();

  /**
   * Creates a transfer from an AWS S3-compatible source to GCS
   */
  async function transferFromS3CompatibleSource() {
    // Runs the request and creates the job
    const [transferJob] = await client.createTransferJob({
      transferJob: {
        projectId,
        transferSpec: {
          sourceAgentPoolName,
          awsS3CompatibleDataSource: {
            region,
            s3Metadata: {
              authMethod,
              protocol,
              requestModel,
            },
            endpoint,
            bucketName: sourceBucketName,
            path: sourcePath,
          },
          gcsDataSink: {
            bucketName: gcsSinkBucket,
            path: gcsPath,
          },
        },
        status: 'ENABLED',
      },
    });

    await client.runTransferJob({
      jobName: transferJob.name,
      projectId,
    });

    console.log(
      `Created and ran a transfer job from '${sourceBucketName}' to '${gcsSinkBucket}' with name ${transferJob.name}`
    );
  }

  transferFromS3CompatibleSource();
  // [END storagetransfer_transfer_from_s3_compatible_source]
}

main(...process.argv.slice(2));

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
