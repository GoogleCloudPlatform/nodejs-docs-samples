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
//   title: Write Time Series Data
//   description: Writes example time series data to 'custom.googleapis.com/stores/daily_sales'.
//   usage: node metrics.writeTimeSeriesData.js your-project-id

function main(projectId) {
  // [START monitoring_write_timeseries]
  // Imports the Google Cloud client library
  const monitoring = require('@google-cloud/monitoring');

  // Creates a client
  const client = new monitoring.MetricServiceClient();

  async function writeTimeSeriesData() {
    /**
     * TODO(developer): Uncomment and edit the following lines of code.
     */
    // const projectId = 'YOUR_PROJECT_ID';

    const dataPoint = {
      interval: {
        endTime: {
          seconds: Date.now() / 1000,
        },
      },
      value: {
        doubleValue: 123.45,
      },
    };

    const timeSeriesData = {
      metric: {
        type: 'custom.googleapis.com/stores/daily_sales',
        labels: {
          store_id: 'Pittsburgh',
        },
      },
      resource: {
        type: 'global',
        labels: {
          project_id: projectId,
        },
      },
      points: [dataPoint],
    };

    const request = {
      name: client.projectPath(projectId),
      timeSeries: [timeSeriesData],
    };

    // Writes time series data
    const result = await client.createTimeSeries(request);
    console.log('Done writing time series data.', result);
  }
  writeTimeSeriesData();
  // [END monitoring_write_timeseries]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
