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

function main(bucketName = 'my-bucket', filterMode = 'Enabled') {
  // [START storage_create_bucket_ip_filtering]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Toggle data filtering (e.g., 'Enabled' | 'Disabled')
  // const filterMode = 'Enabled';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function createBucketWithIpFilter() {
    const ipFilter = {
      mode: filterMode,
      publicNetworkSource: {
        allowedIpCidrRanges: ['8.8.8.8/32'],
      },
      allowCrossOrgVpcs: false,
      allowAllServiceAgentAccess: false,
    };

    const [bucket] = await storage.createBucket(bucketName, {
      ipFilter: ipFilter,
    });

    console.log(
      `Bucket ${bucket.name} created with IP filter mode ${bucket.metadata.ipFilter.mode}.`
    );
  }

  createBucketWithIpFilter().catch(console.error);
  // [END storage_create_bucket_ip_filtering]
}

main(...process.argv.slice(2));
