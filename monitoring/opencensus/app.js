/*
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const express = require('express');
const app = express();
const Stopwatch = require('node-stopwatch').Stopwatch;
// [START monitoring_sli_metrics_opencensus_setup]
// opencensus setup
const {globalStats, MeasureUnit, AggregationType} = require('@opencensus/core');
const {StackdriverStatsExporter} = require('@opencensus/exporter-stackdriver');
// [END monitoring_sli_metrics_opencensus_setup]
// [START monitoring_sli_metrics_opencensus_exporter]
// Stackdriver export interval is 60 seconds
const EXPORT_INTERVAL = 60;
// [END monitoring_sli_metrics_opencensus_exporter]

// define the "golden signals" metrics and views
// [START monitoring_sli_metrics_opencensus_measure]
const REQUEST_COUNT = globalStats.createMeasureInt64(
  'request_count',
  MeasureUnit.UNIT,
  'Number of requests to the server'
);
// [END monitoring_sli_metrics_opencensus_measure]
// [START monitoring_sli_metrics_opencensus_view]
const request_count_metric = globalStats.createView(
  'request_count_metric',
  REQUEST_COUNT,
  AggregationType.COUNT
);
globalStats.registerView(request_count_metric);
// [END monitoring_sli_metrics_opencensus_view]
// [START monitoring_sli_metrics_opencensus_measure]
const ERROR_COUNT = globalStats.createMeasureInt64(
  'error_count',
  MeasureUnit.UNIT,
  'Number of failed requests to the server'
);
// [END monitoring_sli_metrics_opencensus_measure]
// [START monitoring_sli_metrics_opencensus_view]
const error_count_metric = globalStats.createView(
  'error_count_metric',
  ERROR_COUNT,
  AggregationType.COUNT
);
globalStats.registerView(error_count_metric);
// [END monitoring_sli_metrics_opencensus_view]
// [START monitoring_sli_metrics_opencensus_measure]
const RESPONSE_LATENCY = globalStats.createMeasureInt64(
  'response_latency',
  MeasureUnit.MS,
  'The server response latency in milliseconds'
);
// [END monitoring_sli_metrics_opencensus_measure]
// [START monitoring_sli_metrics_opencensus_view]
const latency_metric = globalStats.createView(
  'response_latency_metric',
  RESPONSE_LATENCY,
  AggregationType.DISTRIBUTION,
  [],
  'Server response latency distribution',
  // Latency in buckets:
  [0, 1000, 2000, 3000, 4000, 5000, 10000]
);
globalStats.registerView(latency_metric);
// [END monitoring_sli_metrics_opencensus_view]

// Enable OpenCensus exporters to export metrics to Stackdriver Monitoring.
// Exporters use Application Default Credentials (ADCs) to authenticate.
// See https://developers.google.com/identity/protocols/application-default-credentials
// for more details.
// Expects ADCs to be provided through the environment as ${GOOGLE_APPLICATION_CREDENTIALS}
// A Stackdriver workspace is required and provided through the environment as ${GOOGLE_PROJECT_ID}
const projectId = process.env.GOOGLE_PROJECT_ID;

// GOOGLE_APPLICATION_CREDENTIALS are expected by a dependency of this code
// Not this code itself. Checking for existence here but not retaining (as not needed)
if (!projectId || !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  throw Error('Unable to proceed without a Project ID');
}
// [START monitoring_sli_metrics_opencensus_exporter]
const exporter = new StackdriverStatsExporter({
  projectId: projectId,
  period: EXPORT_INTERVAL * 1000,
});
globalStats.registerExporter(exporter);
// [END monitoring_sli_metrics_opencensus_exporter]

app.get('/', (req, res) => {
  // start request timer
  const stopwatch = Stopwatch.create();
  stopwatch.start();
  // [START monitoring_sli_metrics_opencensus_counts]
  // record a request count for every request
  globalStats.record([
    {
      measure: REQUEST_COUNT,
      value: 1,
    },
  ]);

  // randomly throw an error 10% of the time
  const randomValue = Math.floor(Math.random() * 9 + 1);
  if (randomValue === 1) {
    // Record a failed request.
    globalStats.record([
      {
        measure: ERROR_COUNT,
        value: 1,
      },
    ]);
    // [END monitoring_sli_metrics_opencensus_counts]
    // Return error.
    res.status(500).send('failure');

    // Record latency.
    globalStats.record([
      {
        measure: RESPONSE_LATENCY,
        value: stopwatch.elapsedMilliseconds,
      },
    ]);
    stopwatch.stop();
  } else {
    res.status(200).send('success!');

    // Record latency for every request.
    // [START monitoring_sli_metrics_opencensus_latency]
    globalStats.record([
      {
        measure: RESPONSE_LATENCY,
        value: stopwatch.elapsedMilliseconds,
      },
    ]);
    // [END monitoring_sli_metrics_opencensus_latency]
    stopwatch.stop();
  }
});

module.exports = app;
app.listen(8080, () => console.log('Example app listening on port 8080!'));
