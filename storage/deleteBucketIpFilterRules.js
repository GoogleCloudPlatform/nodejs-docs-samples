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

function main(bucketName = 'my-bucket') {
  // [START storage_delete_ip_filtering_rules]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of your GCS bucket
  // const bucketName = 'your-unique-bucket-name';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage();

  async function deleteBucketIpFilterRules() {
    // Note: To delete specific rules, you fetch the existing config, filter out the rules, and update.
    const [metadata] = await storage.bucket(bucketName).getMetadata();

    if (!metadata.ipFilter) {
      console.log(`No IP Filter configuration found for bucket ${bucketName}.`);
      return;
    }

    const updatedIpRanges = (
      metadata.ipFilter.publicNetworkSource?.allowedIpCidrRanges || []
    ).filter(range => range !== '8.8.8.8/32');

    const updatedIpFilter = {
      ...metadata.ipFilter,
      publicNetworkSource: {
        ...metadata.ipFilter.publicNetworkSource,
        allowedIpCidrRanges: updatedIpRanges,
      },
    };

    const [updatedMetadata] = await storage.bucket(bucketName).setMetadata({
      ipFilter: updatedIpFilter,
    });

    console.log(`Specific IP Filter rules deleted for bucket ${bucketName}.`);
    console.log(JSON.stringify(updatedMetadata.ipFilter, null, 2));
  }

  deleteBucketIpFilterRules().catch(console.error);
  // [END storage_delete_ip_filtering_rules]
}

main(...process.argv.slice(2));
