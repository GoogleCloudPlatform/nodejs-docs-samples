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
//   title: List Monitored Resource Descriptors
//   usage: node metrics.listMonitoredResourceDescriptors.js your-project-id

function main(projectId) {
  // [START monitoring_list_resources]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  async function listMonitoredResourceDescriptors() {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    // const projectId = 'YOUR_PROJECT_ID';

    const request = {
      name: client.projectPath(projectId),
    };

    // Lists monitored resource descriptors
    const [descriptors] = await client.listMonitoredResourceDescriptors(
      request
    );
    console.log('Monitored Resource Descriptors:');
    descriptors.forEach(descriptor => {
      console.log(descriptor.name);
      console.log(`  Type: ${descriptor.type}`);
      if (descriptor.labels) {
        console.log('  Labels:');
        descriptor.labels.forEach(label => {
          console.log(
            `    ${label.key} (${label.valueType}): ${label.description}`
          );
        });
      }
      console.log();
    });
  }
  listMonitoredResourceDescriptors();
  // [END monitoring_list_resources]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
