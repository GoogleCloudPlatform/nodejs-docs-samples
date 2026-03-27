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
//   title: Set Bucket Encryption Enforcement
//   description: Configures a bucket to enforce specific encryption types (e.g., CMEK-only).
//   usage: node setBucketEncryptionEnforcementConfig.js <BUCKET_NAME> <KMS_KEY_NAME>

function main(
  bucketName = 'my-bucket',
  defaultKmsKeyName = process.env.GOOGLE_CLOUD_KMS_KEY_ASIA
) {
  // [START storage_set_encryption_enforcement_config]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // The name of the KMS key to be used as the default
  // const defaultKmsKeyName = 'my-key';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function setBucketEncryptionEnforcementConfig() {
    const options = {
      encryption: {
        defaultKmsKeyName: defaultKmsKeyName,
        googleManagedEncryptionEnforcementConfig: {
          restrictionMode: 'FullyRestricted',
        },
        customerSuppliedEncryptionEnforcementConfig: {
          restrictionMode: 'FullyRestricted',
        },
        customerManagedEncryptionEnforcementConfig: {
          restrictionMode: 'NotRestricted',
        },
      },
    };

    const [metadata] = await storage.bucket(bucketName).setMetadata(options);

    console.log(
      `Encryption enforcement configuration updated for bucket ${bucketName}.`
    );
    const enc = metadata.encryption;
    if (enc) {
      console.log(`Default KMS Key: ${enc.defaultKmsKeyName}`);

      const logEnforcement = (label, config) => {
        if (config) {
          console.log(`${label}:`);
          console.log(`  Mode: ${config.restrictionMode}`);
          console.log(`  Effective: ${config.effectiveTime}`);
        }
      };

      logEnforcement(
        'Google Managed (GMEK) Enforcement',
        enc.googleManagedEncryptionEnforcementConfig
      );
      logEnforcement(
        'Customer Managed (CMEK) Enforcement',
        enc.customerManagedEncryptionEnforcementConfig
      );
      logEnforcement(
        'Customer Supplied (CSEK) Enforcement',
        enc.customerSuppliedEncryptionEnforcementConfig
      );
    }
  }

  setBucketEncryptionEnforcementConfig().catch(console.error);
  // [END storage_set_encryption_enforcement_config]
}
main(...process.argv.slice(2));
