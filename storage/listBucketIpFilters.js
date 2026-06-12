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

function main(projectId = 'my-project-id') {
  // [START storage_list_buckets_ip_filtering]
  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // The ID of the project to which the service account belongs
  // const projectId = 'my-project-id';

  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage({projectId});

  async function listBucketsIpFiltering() {
    const [buckets] = await storage.getBuckets();

    for (const bucket of buckets) {
      if (bucket.metadata.ipFilter) {
        try {
          const [metadata] = await storage.bucket(bucket.name).getMetadata();
          const ipFilter = metadata.ipFilter;
          console.log(`${bucket.name}: IP Filter Mode - ${ipFilter.mode}`);

          const publicNetworkSource = ipFilter.publicNetworkSource;
          if (publicNetworkSource && publicNetworkSource.allowedIpCidrRanges) {
            console.log('  Public Network Allowed IP Ranges:');
            publicNetworkSource.allowedIpCidrRanges.forEach(range => {
              console.log(`  - ${range}`);
            });
          }

          const vpcNetworkSources = ipFilter.vpcNetworkSources;
          if (vpcNetworkSources && vpcNetworkSources.length > 0) {
            console.log('  VPC Network Sources:');
            vpcNetworkSources.forEach(source => {
              console.log(`  - Network: ${source.network}`);
              if (source.allowedIpCidrRanges) {
                source.allowedIpCidrRanges.forEach(range => {
                  console.log(`    - ${range}`);
                });
              }
            });
          }
        } catch (err) {
          console.log(
            `${bucket.name}: Error fetching IP filter - ${err.message}`
          );
        }
      }
    }
  }

  listBucketsIpFiltering().catch(console.error);
  // [END storage_list_buckets_ip_filtering]
}

main(...process.argv.slice(2));
