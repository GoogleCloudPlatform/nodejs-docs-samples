// Copyright 2025 Google LLC
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

// [START auth_custom_credential_supplier_aws]
const {AwsClient} = require('google-auth-library');
const {fromNodeProviderChain} = require('@aws-sdk/credential-providers');
const fs = require('fs');
const path = require('path');
const {STSClient} = require('@aws-sdk/client-sts');
const {Storage} = require('@google-cloud/storage');

/**
 * Custom AWS Security Credentials Supplier.
 *
 * This implementation resolves AWS credentials using the default Node provider
 * chain from the AWS SDK. This allows fetching credentials from environment
 * variables, shared credential files (~/.aws/credentials), or IAM roles
 * for service accounts (IRSA) in EKS, etc.
 */
class CustomAwsSupplier {
  constructor() {
    this.region = null;

    this.awsCredentialsProvider = fromNodeProviderChain();
  }

  /**
   * Returns the AWS region. This is required for signing the AWS request.
   * It resolves the region automatically by using the default AWS region
   * provider chain, which searches for the region in the standard locations
   * (environment variables, AWS config file, etc.).
   */
  async getAwsRegion(_context) {
    if (this.region) {
      return this.region;
    }

    const client = new STSClient({});
    this.region = await client.config.region();

    if (!this.region) {
      throw new Error(
        'CustomAwsSupplier: Unable to resolve AWS region. Please set the AWS_REGION environment variable or configure it in your ~/.aws/config file.'
      );
    }

    return this.region;
  }

  /**
   * Retrieves AWS security credentials using the AWS SDK's default provider chain.
   */
  async getAwsSecurityCredentials(_context) {
    const awsCredentials = await this.awsCredentialsProvider();

    if (!awsCredentials.accessKeyId || !awsCredentials.secretAccessKey) {
      throw new Error(
        'Unable to resolve AWS credentials from the node provider chain. ' +
          'Ensure your AWS CLI is configured, or AWS environment variables (like AWS_ACCESS_KEY_ID) are set.'
      );
    }

    return {
      accessKeyId: awsCredentials.accessKeyId,
      secretAccessKey: awsCredentials.secretAccessKey,
      token: awsCredentials.sessionToken,
    };
  }
}

/**
 * Authenticates with Google Cloud using AWS credentials and retrieves bucket metadata.
 *
 * @param {string} bucketName The name of the bucket to retrieve.
 * @param {string} audience The Workload Identity Pool audience.
 * @param {string} [impersonationUrl] Optional Service Account impersonation URL.
 */
async function authenticateWithAwsCredentials(
  bucketName,
  audience,
  impersonationUrl
) {
  const customSupplier = new CustomAwsSupplier();

  const clientOptions = {
    audience: audience,
    subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
    service_account_impersonation_url: impersonationUrl,
    aws_security_credentials_supplier: customSupplier,
  };

  const authClient = new AwsClient(clientOptions);

  const storage = new Storage({
    authClient: authClient,
  });

  const [metadata] = await storage.bucket(bucketName).getMetadata();
  return metadata;
}
// [END auth_custom_credential_supplier_aws]

/**
 * If a local secrets file is present, load it into the process environment.
 * This is a "just-in-time" configuration for local development. These
 * variables are only set for the current process.
 */
function loadConfigFromFile() {
  const secretsFile = 'custom-credentials-aws-secrets.json';
  const secretsPath = path.resolve(__dirname, secretsFile);

  if (!fs.existsSync(secretsPath)) {
    return;
  }

  try {
    const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
    if (!secrets) {
      return;
    }

    const configMapping = {
      aws_access_key_id: 'AWS_ACCESS_KEY_ID',
      aws_secret_access_key: 'AWS_SECRET_ACCESS_KEY',
      aws_region: 'AWS_REGION',
      gcp_workload_audience: 'GCP_WORKLOAD_AUDIENCE',
      gcs_bucket_name: 'GCS_BUCKET_NAME',
      gcp_service_account_impersonation_url:
        'GCP_SERVICE_ACCOUNT_IMPERSONATION_URL',
    };
  } catch (error) {
    console.error(`Error reading secrets file: ${error.message}`);
  }
}

async function main() {
  loadConfigFromFile();

  const gcpAudience = process.env.GCP_WORKLOAD_AUDIENCE;
  const saImpersonationUrl = process.env.GCP_SERVICE_ACCOUNT_IMPERSONATION_URL;
  const gcsBucketName = process.env.GCS_BUCKET_NAME;

  if (!gcpAudience || !gcsBucketName) {
    throw new Error(
      'Missing required configuration. Please provide it in a ' +
        'secrets.json file or as environment variables: ' +
        'GCP_WORKLOAD_AUDIENCE, GCS_BUCKET_NAME'
    );
  }

  try {
    console.log(`Retrieving metadata for bucket: ${gcsBucketName}...`);
    const bucketMetadata = await authenticateWithAwsCredentials(
      gcsBucketName,
      gcpAudience,
      saImpersonationUrl
    );
    console.log('\n--- SUCCESS! ---');
    console.log('Bucket Metadata:', JSON.stringify(bucketMetadata, null, 2));
  } catch (error) {
    console.error('\n--- FAILED ---');
    console.error(error.message || error);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

exports.authenticateWithAwsCredentials = authenticateWithAwsCredentials;
