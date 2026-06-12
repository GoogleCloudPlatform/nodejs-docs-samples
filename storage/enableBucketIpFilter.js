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
  // [START storage_enable_ip_filtering]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function enableBucketIpFilter() {
    // Note: IP Filter configurations cannot be partially updated.
    // We must fetch the existing configuration and modify it, or set a completely new one.
    const [metadata] = await storage.bucket(bucketName).getMetadata();
    const existingIpFilter = metadata.ipFilter || {
      mode: filterMode,
      publicNetworkSource: {allowedIpCidrRanges: ['0.0.0.0/0']},
      allowCrossOrgVpcs: false,
      allowAllServiceAgentAccess: false,
    };

    // Add a new IP range to publicNetworkSource
    const updatedIpRanges =
      existingIpFilter.publicNetworkSource?.allowedIpCidrRanges || [];
    if (!updatedIpRanges.includes('8.8.8.8/32')) {
      updatedIpRanges.push('8.8.8.8/32');
    }

    const updatedIpFilter = {
      ...existingIpFilter,
      publicNetworkSource: {
        allowedIpCidrRanges: updatedIpRanges,
      },
    };

    const [updatedMetadata] = await storage.bucket(bucketName).setMetadata({
      ipFilter: updatedIpFilter,
    });

    console.log(`IP Filter enabled for bucket ${bucketName}.`);
    console.log(JSON.stringify(updatedMetadata.ipFilter, null, 2));
  }

  enableBucketIpFilter().catch(console.error);
  // [END storage_enable_ip_filtering]
}

main(...process.argv.slice(2));
