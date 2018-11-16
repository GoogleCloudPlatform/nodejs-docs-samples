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

const monitoring = require(`@google-cloud/monitoring`);
const client = new monitoring.MetricServiceClient();
const path = require(`path`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node metrics.js`;
const cwd = path.join(__dirname, `..`);
const customMetricId = `custom.googleapis.com/stores/daily_sales`;
const computeMetricId = `compute.googleapis.com/instance/cpu/utilization`;
const filter = `metric.type="${computeMetricId}"`;
const projectId = process.env.GCLOUD_PROJECT;
const resourceId = `cloudsql_database`;

before(tools.checkCredentials);

it(`should create a metric descriptors`, async () => {
  const output = await tools.runAsync(`${cmd} create`, cwd);
  assert.strictEqual(output.includes(`Created custom Metric`), true);
  assert.strictEqual(output.includes(`Type: ${customMetricId}`), true);
});

it(`should list metric descriptors, including the new custom one`, async () => {
  const attempt = tools.tryTest(async assert => {
    const output = await tools.runAsync(`${cmd} list`, cwd);
    assert(output.includes(customMetricId));
    assert(output.includes(computeMetricId));
  });
  attempt.tries(30);
  attempt.timeout(120000);
  await attempt.start();
});

it(`should get a metric descriptor`, async () => {
  const attempt = tools.tryTest(async assert => {
    const output = await tools.runAsync(`${cmd} get ${customMetricId}`, cwd);
    assert(output.includes(`Type: ${customMetricId}`));
  });
  attempt.tries(30);
  attempt.timeout(120000);
  await attempt.start();
});

it(`should write time series data`, async () => {
  const output = await tools.runAsync(`${cmd} write`, cwd);
  assert.strictEqual(output.includes(`Done writing time series data.`), true);
});

it(`should delete a metric descriptor`, async () => {
  const output = await tools.runAsync(`${cmd} delete ${customMetricId}`, cwd);
  assert.strictEqual(output.includes(`Deleted ${customMetricId}`), true);
});

it(`should list monitored resource descriptors`, async () => {
  const output = await tools.runAsync(`${cmd} list-resources`, cwd);
  assert.strictEqual(
    output.includes(
      `projects/${projectId}/monitoredResourceDescriptors/${resourceId}`
    ),
    true
  );
});

it(`should get a monitored resource descriptor`, async () => {
  const output = await tools.runAsync(`${cmd} get-resource ${resourceId}`, cwd);
  assert.strictEqual(output.includes(`Type: ${resourceId}`), true);
});

it(`should read time series data`, async () => {
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
  const output = await tools.runAsync(`${cmd} read '${filter}'`, cwd);
  //t.true(true); // Do not fail if there is simply no data to return.
  timeSeries.forEach(data => {
    assert.strictEqual(
      output.includes(`${data.metric.labels.instance_name}:`),
      true
    );
    data.points.forEach(point => {
      assert.strictEqual(output.includes(JSON.stringify(point.value)), true);
    });
  });
});

it(`should read time series data fields`, async () => {
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
  const output = await tools.runAsync(`${cmd} read-fields`, cwd);
  assert.strictEqual(
    output.includes(`Found data points for the following instances:`),
    true
  );
  timeSeries.forEach(data => {
    assert.strictEqual(output.includes(data.metric.labels.instance_name), true);
  });
});

it(`should read time series data aggregated`, async () => {
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
  const output = await tools.runAsync(`${cmd} read-aggregate`, cwd);
  assert.strictEqual(output.includes('CPU utilization:'), true);
  timeSeries.forEach(data => {
    assert.strictEqual(
      new RegExp(data.metric.labels.instance_name).test(output),
      true
    );
    assert.strictEqual(output.includes(' Now: 0.'), true);
    assert.strictEqual(output.includes(' 10 min ago: 0.'), true);
  });
});

it(`should read time series data reduced`, async () => {
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
  const output = await tools.runAsync(`${cmd} read-reduce`, cwd);
  // Special case: No output.
  if (output === 'No data') {
    assert.strictEqual(output.includes('No data'), true);
  } else {
    assert.strictEqual(
      output.includes(`Average CPU utilization across all GCE instances:`),
      true
    );
    assert.strictEqual(output.includes(`  Last 10 min`), true);
    assert.strictEqual(output.includes(`  10-20 min ago`), true);
  }
});
