/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const monitoring = require('@google-cloud/monitoring');
const {assert} = require('chai');
const execa = require('execa');
const retry = require('p-retry');

const exec = async cmd => (await execa.shell(cmd)).stdout;
const client = new monitoring.MetricServiceClient();
const cmd = `node metrics.js`;
const customMetricId = `custom.googleapis.com/stores/daily_sales`;
const computeMetricId = `compute.googleapis.com/instance/cpu/utilization`;
const filter = `metric.type="${computeMetricId}"`;
const projectId = process.env.GCLOUD_PROJECT;
const resourceId = `cloudsql_database`;

describe('metrics', () => {
  it('should create a metric descriptors', async () => {
    const output = await exec(`${cmd} create`);
    assert.match(output, /Created custom Metric/);
    assert.match(output, new RegExp(`Type: ${customMetricId}`));
  });

  it('should list metric descriptors, including the new custom one', async () => {
    // The write above appears to be eventually consistent. This retry should
    // not be needed.  The tracking bug is here:
    // https://github.com/googleapis/nodejs-monitoring/issues/190
    await retry(
      async () => {
        const output = await exec(`${cmd} list`);
        assert.match(output, new RegExp(customMetricId));
        assert.match(output, new RegExp(computeMetricId));
      },
      {
        retries: 10,
        onFailedAttempt: () => console.warn('Read failed, retrying...'),
      }
    );
  });

  it('should get a metric descriptor', async () => {
    const output = await exec(`${cmd} get ${customMetricId}`);
    assert.match(output, new RegExp(`Type: ${customMetricId}`));
  });

  it('should write time series data', async () => {
    const output = await exec(`${cmd} write`);
    assert.match(output, /Done writing time series data./);
  });

  it('should delete a metric descriptor', async () => {
    const output = await exec(`${cmd} delete ${customMetricId}`);
    assert.match(output, new RegExp(`Deleted ${customMetricId}`));
  });

  it('should list monitored resource descriptors', async () => {
    const output = await exec(`${cmd} list-resources`);
    assert.match(
      output,
      new RegExp(
        `projects/${projectId}/monitoredResourceDescriptors/${resourceId}`
      )
    );
  });

  it('should get a monitored resource descriptor', async () => {
    const output = await exec(`${cmd} get-resource ${resourceId}`);
    assert.match(output, new RegExp(`Type: ${resourceId}`));
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
    const output = await exec(`${cmd} read '${filter}'`);
    //t.true(true); // Do not fail if there is simply no data to return.
    timeSeries.forEach(data => {
      assert.match(output, new RegExp(`${data.metric.labels.instance_name}:`));
      data.points.forEach(point => {
        assert.match(output, new RegExp(JSON.stringify(point.value)));
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
      view: `HEADERS`,
    });
    const output = await exec(`${cmd} read-fields`);
    assert.match(output, /Found data points for the following instances/);
    timeSeries.forEach(data => {
      assert.match(output, new RegExp(data.metric.labels.instance_name));
    });
  });

  it('should read time series data aggregated', async () => {
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
        perSeriesAligner: `ALIGN_MEAN`,
      },
    });
    const output = await exec(`${cmd} read-aggregate`);
    assert.match(output, /CPU utilization:/);
    timeSeries.forEach(data => {
      assert.match(output, new RegExp(data.metric.labels.instance_name));
      assert.match(output, / Now: 0./);
      assert.match(output, / 10 min ago: 0./);
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
        crossSeriesReducer: `REDUCE_MEAN`,
        perSeriesAligner: `ALIGN_MEAN`,
      },
    });
    const output = await exec(`${cmd} read-reduce`);
    // Special case: No output.
    if (output === 'No data') {
      assert.match(output, /No data/);
    } else {
      assert.match(output, /Average CPU utilization across all GCE instances:/);
      assert.match(output, / {2}Last 10 min/);
      assert.match(output, / {2}10-20 min ago/);
    }
  });
});
