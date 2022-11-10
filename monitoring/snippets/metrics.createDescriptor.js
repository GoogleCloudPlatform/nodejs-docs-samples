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
//   title: Create Metric Descriptor
//   description: Creates an example 'custom.googleapis.com/stores/daily_sales' custom metric descriptor.
//   usage: node metrics.createDescriptor.js your-project-id

function main(projectId) {
  // [START monitoring_create_metric]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  /**
   * TODO(developer): Uncomment and edit the following lines of code.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  async function createMetricDescriptor() {
    const request = {
      name: client.projectPath(projectId),
      metricDescriptor: {
        description: 'Daily sales records from all branch stores.',
        displayName: 'Daily Sales',
        type: 'custom.googleapis.com/stores/daily_sales',
        metricKind: 'GAUGE',
        valueType: 'DOUBLE',
        unit: '{USD}',
        labels: [
          {
            key: 'store_id',
            valueType: 'STRING',
            description: 'The ID of the store.',
          },
        ],
      },
    };

    // Creates a custom metric descriptor
    const [descriptor] = await client.createMetricDescriptor(request);
    console.log('Created custom Metric:\n');
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
  createMetricDescriptor();
  // [END monitoring_create_metric]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
