// Copyright 2017 Google LLC
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
//   title: List Metric Descriptors
//   usage: node metrics.listDescriptors.js your-project-id

function main(projectId) {
  // [START monitoring_list_descriptors]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  async function listMetricDescriptors() {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    // const projectId = 'YOUR_PROJECT_ID';

    const request = {
      name: client.projectPath(projectId),
    };

    // Lists metric descriptors
    const [descriptors] = await client.listMetricDescriptors(request);
    console.log('Metric Descriptors:');
    descriptors.forEach(descriptor => console.log(descriptor.name));
  }
  listMetricDescriptors();
  // [END monitoring_list_descriptors]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
