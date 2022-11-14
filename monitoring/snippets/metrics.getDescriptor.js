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
//   title: Get Metric Descriptor
//   description: Gets a custom metric descriptor
//   usage: node metrics.getDescriptor.js your-project-id custom.googleapis.com/your/id

function main(projectId, metricId) {
  // [START monitoring_get_descriptor]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  async function getMetricDescriptor() {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const metricId = 'custom.googleapis.com/your/id';

    const request = {
      name: client.projectMetricDescriptorPath(projectId, metricId),
    };

    // Retrieves a metric descriptor
    const [descriptor] = await client.getMetricDescriptor(request);
    console.log(`Name: ${descriptor.displayName}`);
    console.log(`Description: ${descriptor.description}`);
    console.log(`Type: ${descriptor.type}`);
    console.log(`Kind: ${descriptor.metricKind}`);
    console.log(`Value Type: ${descriptor.valueType}`);
    console.log(`Unit: ${descriptor.unit}`);
    console.log('Labels:');
    descriptor.labels.forEach(label => {
      console.log(`  ${label.key} (${label.valueType}) - ${label.description}`);
    });
  }
  getMetricDescriptor();
  // [END monitoring_get_descriptor]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
