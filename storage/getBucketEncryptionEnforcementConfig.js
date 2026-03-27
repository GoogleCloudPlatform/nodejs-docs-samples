// Copyright 2026 Google LLC
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
//   title: Get Bucket Encryption Enforcement
//   description: Retrieves the current encryption enforcement configurations for a bucket.
//   usage: node getBucketEncryptionEnforcementConfig.js <BUCKET_NAME>

function main(bucketName = 'my-bucket') {
  // [START storage_get_encryption_enforcement_config]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function getBucketEncryptionEnforcementConfig() {
    const [metadata] = await storage.bucket(bucketName).getMetadata();

    console.log(
      `Encryption enforcement configuration for bucket ${bucketName}.`
    );
    const enc = metadata.encryption;
    if (!enc) {
      console.log(
        'No encryption configuration found (Default GMEK is active).'
      );
      return;
    }
    console.log(`Default KMS Key: ${enc.defaultKmsKeyName || 'None'}`);

    const printConfig = (label, config) => {
      if (config) {
        console.log(`${label}:`);
        console.log(`  Mode: ${config.restrictionMode}`);
        console.log(`  Effective: ${config.effectiveTime}`);
      }
    };

    printConfig(
      'Google Managed (GMEK) Enforcement',
      enc.googleManagedEncryptionEnforcementConfig
    );
    printConfig(
      'Customer Managed (CMEK) Enforcement',
      enc.customerManagedEncryptionEnforcementConfig
    );
    printConfig(
      'Customer Supplied (CSEK) Enforcement',
      enc.customerSuppliedEncryptionEnforcementConfig
    );
  }

  getBucketEncryptionEnforcementConfig().catch(console.error);
  // [END storage_get_encryption_enforcement_config]
}
main(...process.argv.slice(2));
