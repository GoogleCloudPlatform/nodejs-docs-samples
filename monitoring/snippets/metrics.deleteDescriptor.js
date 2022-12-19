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
//   title: Delete Metric Descriptor
//   description: Deletes a custom metric descriptor.
//   usage: node metrics.deleteDescriptor.js your-project-id custom.googleapis.com/stores/daily_sales

function main(projectId, metricId) {
  // [START monitoring_delete_metric]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  async function deleteMetricDescriptor() {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const metricId = 'custom.googleapis.com/stores/daily_sales';

    const request = {
      name: client.projectMetricDescriptorPath(projectId, metricId),
    };

    // Deletes a metric descriptor
    const [result] = await client.deleteMetricDescriptor(request);
    console.log(`Deleted ${metricId}`, result);
  }
  deleteMetricDescriptor();
  // [END monitoring_delete_metric]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
