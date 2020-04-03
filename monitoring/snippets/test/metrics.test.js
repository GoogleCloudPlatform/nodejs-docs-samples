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

const monitoring = require('@google-cloud/monitoring');
const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const client = new monitoring.MetricServiceClient();
const cmd = 'node metrics.js';
const customMetricId = 'custom.googleapis.com/stores/daily_sales';
const computeMetricId = 'compute.googleapis.com/instance/cpu/utilization';
const filter = `metric.type="${computeMetricId}"`;
const projectId = process.env.GCLOUD_PROJECT;
const resourceId = 'cloudsql_database';

// A helper for delaying integration tests with an exponential backoff.
// See examples like: https://github.com/googleapis/nodejs-monitoring/issues/190,
// https://github.com/googleapis/nodejs-monitoring/issues/191.
const delay = async test => {
  const retries = test.currentRetry();
  if (retries === 0) return; // no retry on the first failure.
  // see: https://cloud.google.com/storage/docs/exponential-backoff:
  const ms = Math.pow(2, retries) * 500 + Math.random() * 1000;
  return new Promise(done => {
    console.info(`retrying "${test.title}" in ${ms}ms`);
    setTimeout(done, ms);
  });
};
describe('metrics', async () => {
  it('should create a metric descriptors', async function() {
    this.retries(8);
    await delay(this.test);
    const output = execSync(`${cmd} create`);
    assert.include(output, 'Created custom Metric');
    assert.include(output, `Type: ${customMetricId}`);
  });

  it('should list metric descriptors, including the new custom one', async function() {
    this.retries(8);
    await delay(this.test);
    const output = execSync(`${cmd} list`);
    assert.include(output, customMetricId);
    assert.include(output, computeMetricId);
  });

  it('should get a metric descriptor', () => {
    const output = execSync(`${cmd} get ${customMetricId}`);
    assert.include(output, `Type: ${customMetricId}`);
  });

  it('should write time series data', async function() {
    this.retries(5);
    await delay(this.test);
    const output = execSync(`${cmd} write`);
    assert.include(output, 'Done writing time series data.');
  });

  it('should delete a metric descriptor', async function() {
    this.retries(5);
    await delay(this.test);
    const output = execSync(`${cmd} delete ${customMetricId}`);
    assert.include(output, `Deleted ${customMetricId}`);
  });

  it('should list monitored resource descriptors', () => {
    const output = execSync(`${cmd} list-resources`);
    assert.include(
      output,
      `projects/${projectId}/monitoredResourceDescriptors/${resourceId}`
    );
  });

  it('should get a monitored resource descriptor', () => {
    const output = execSync(`${cmd} get-resource ${resourceId}`);
    assert.include(output, `Type: ${resourceId}`);
  });

  it('should read time series data', async () => {
    const [timeSeries] = await client.listTimeSeries({
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
    });
    const output = execSync(`${cmd} read '${filter}'`);
    //t.true(true); // Do not fail if there is simply no data to return.
    timeSeries.forEach(data => {
      assert.include(output, `${data.metric.labels.instance_name}:`);
      data.points.forEach(point => {
        assert.include(output, JSON.stringify(point.value));
      });
    });
  });

  it('should read time series data fields', async () => {
    const [timeSeries] = await client.listTimeSeries({
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
      // Don't return time series data, instead just return information about
      // the metrics that match the filter
      view: 'HEADERS',
    });
    const output = execSync(`${cmd} read-fields`);
    assert.include(output, 'Found data points for the following instances');
    timeSeries.forEach(data => {
      assert.include(output, data.metric.labels.instance_name);
    });
  });

  it('should read time series data aggregated', async function() {
    this.retries(5);
    await delay(this.test);
    const [timeSeries] = await client.listTimeSeries({
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
      // Aggregate results per matching instance
      aggregation: {
        alignmentPeriod: {
          seconds: 600,
        },
        perSeriesAligner: 'ALIGN_MEAN',
      },
    });
    let output;
    try {
      output = execSync(`${cmd} read-aggregate`);
    } catch (e) {
      console.error(e);
      throw e;
    }
    assert.include(output, 'CPU utilization:');
    timeSeries.forEach(data => {
      assert.include(output, data.metric.labels.instance_name);
      assert.include(output, ' Now: 0.');
      assert.include(output, ' 10 min ago: 0.');
    });
  });

  it('should read time series data reduced', async () => {
    await client.listTimeSeries({
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
      // Aggregate results per matching instance
      aggregation: {
        alignmentPeriod: {
          seconds: 600,
        },
        crossSeriesReducer: 'REDUCE_MEAN',
        perSeriesAligner: 'ALIGN_MEAN',
      },
    });
    const output = execSync(`${cmd} read-reduce`);
    // Special case: No output.
    if (output.indexOf('No data') < 0) {
      assert.include(
        output,
        'Average CPU utilization across all GCE instances:'
      );
      assert.include(output, 'Last 10 min');
      assert.include(output, '10-20 min ago');
    }
  });
});
