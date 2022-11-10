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
//   title: Read Time Series Data
//   description: Reads time series data that matches the given filter.
//   usage: node metrics.readTimeSeriesData.js your-project-id 'metric.type="compute.googleapis.com/instance/cpu/utilization"'

function main(projectId, filter) {
  // [START monitoring_read_timeseries_simple]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  async function readTimeSeriesData() {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    // const projectId = 'YOUR_PROJECT_ID';
    // const filter = 'metric.type="compute.googleapis.com/instance/cpu/utilization"';

    const request = {
      name: client.projectPath(projectId),
      filter: filter,
      interval: {
        startTime: {
          // Limit results to the last 20 minutes
          seconds: Date.now() / 1000 - 60 * 20,
        },
        endTime: {
          seconds: Date.now() / 1000,
        },
      },
    };

    // Writes time series data
    const [timeSeries] = await client.listTimeSeries(request);
    timeSeries.forEach(data => {
      console.log(`${data.metric.labels.instance_name}:`);
      data.points.forEach(point => {
        console.log(JSON.stringify(point.value));
      });
    });
  }
  readTimeSeriesData();
  // [END monitoring_read_timeseries_simple]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
