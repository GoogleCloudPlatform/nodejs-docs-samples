// Copyright 2019 Google LLC
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

// [START monitoring_opencensus_metrics_quickstart]
'use strict';

// [START monitoring_opencensus_metrics_dependencies]
const {globalStats, MeasureUnit, AggregationType} = require('@opencensus/core');
const {StackdriverStatsExporter} = require('@opencensus/exporter-stackdriver');
// [END monitoring_opencensus_metrics_dependencies]

const EXPORT_INTERVAL = process.env.EXPORT_INTERVAL || 60;
const LATENCY_MS = globalStats.createMeasureInt64(
  'task_latency',
  MeasureUnit.MS,
  'The task latency in milliseconds'
);

// Register the view. It is imperative that this step exists,
// otherwise recorded metrics will be dropped and never exported.
const view = globalStats.createView(
  'task_latency_distribution',
  LATENCY_MS,
  AggregationType.DISTRIBUTION,
  [],
  'The distribution of the task latencies.',
  // Latency in buckets:
  // [>=0ms, >=100ms, >=200ms, >=400ms, >=1s, >=2s, >=4s]
  [0, 100, 200, 400, 1000, 2000, 4000]
);

// Then finally register the views
globalStats.registerView(view);

// [START setup_exporter]
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

// The minimum reporting period for Stackdriver is 1 minute.
const exporter = new StackdriverStatsExporter({
  projectId: projectId,
  period: EXPORT_INTERVAL * 1000,
});

// Pass the created exporter to Stats
globalStats.registerExporter(exporter);
// [END setup_exporter]

// Record 100 fake latency values between 0 and 5 seconds.
for (let i = 0; i < 100; i++) {
  const ms = Math.floor(Math.random() * 5);
  console.log(`Latency ${i}: ${ms}`);
  globalStats.record([
    {
      measure: LATENCY_MS,
      value: ms,
    },
  ]);
}

/**
 * The default export interval is 60 seconds. The thread with the
 * StackdriverStatsExporter must live for at least the interval past any
 * metrics that must be collected, or some risk being lost if they are recorded
 * after the last export.
 */
setTimeout(() => {
  console.log('Done recording metrics.');
  globalStats.unregisterExporter(exporter);
}, EXPORT_INTERVAL * 1000);

// [END monitoring_opencensus_metrics_quickstart]
