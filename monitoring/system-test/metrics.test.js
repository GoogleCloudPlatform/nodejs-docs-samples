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

require(`../../system-test/_setup`);

const client = require(`@google-cloud/monitoring`).v3().metricServiceClient();
const path = require(`path`);

const cmd = `node metrics.js`;
const cwd = path.join(__dirname, `..`);
const customMetricId = `custom.googleapis.com/stores/daily_sales`;
const computeMetricId = `compute.googleapis.com/instance/cpu/utilization`;
const filter = `metric.type="${computeMetricId}"`;
const projectId = process.env.GCLOUD_PROJECT;
const resourceId = `cloudsql_database`;

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.serial(`should create a metric descriptors`, async (t) => {
  const output = await runAsync(`${cmd} create`, cwd);
  t.true(output.includes(`Created custom Metric`));
  t.true(output.includes(`Type: ${customMetricId}`));
});

test.serial(`should list metric descriptors, including the new custom one`, async (t) => {
  await tryTest(async () => {
    const output = await runAsync(`${cmd} list`, cwd);
    t.true(output.includes(customMetricId));
    t.true(output.includes(computeMetricId));
  }).start();
});

test.serial(`should get a metric descriptor`, async (t) => {
  await tryTest(async () => {
    const output = await runAsync(`${cmd} get ${customMetricId}`, cwd);
    t.true(output.includes(`Type: ${customMetricId}`));
  }).start();
});

test.serial(`should write time series data`, async (t) => {
  const output = await runAsync(`${cmd} write`, cwd);
  t.true(output.includes(`Done writing time series data.`));
});

test.serial(`should delete a metric descriptor`, async (t) => {
  const output = await runAsync(`${cmd} delete ${customMetricId}`, cwd);
  t.true(output.includes(`Deleted ${customMetricId}`));
});

test(`should list monitored resource descriptors`, async (t) => {
  const output = await runAsync(`${cmd} list-resources`, cwd);
  t.true(output.includes(`projects/${projectId}/monitoredResourceDescriptors/${resourceId}`));
});

test(`should get a monitored resource descriptor`, async (t) => {
  const output = await runAsync(`${cmd} get-resource ${resourceId}`, cwd);
  t.true(output.includes(`Type: ${resourceId}`));
});

test(`should read time series data`, async (t) => {
  const [timeSeries] = await client.listTimeSeries({
    name: client.projectPath(projectId),
    filter: filter,
    interval: {
      startTime: {
        // Limit results to the last 20 minutes
        seconds: (Date.now() / 1000) - (60 * 20)
      },
      endTime: {
        seconds: Date.now() / 1000
      }
    }
  });
  const output = await runAsync(`${cmd} read '${filter}'`, cwd);
  timeSeries.forEach((data) => {
    t.true(output.includes(`${data.metric.labels.instance_name}:`));
    data.points.forEach((point) => {
      t.true(output.includes(JSON.stringify(point.value)));
    });
  });
});

test(`should read time series data fields`, async (t) => {
  const [timeSeries] = await client.listTimeSeries({
    name: client.projectPath(projectId),
    filter: filter,
    interval: {
      startTime: {
        // Limit results to the last 20 minutes
        seconds: (Date.now() / 1000) - (60 * 20)
      },
      endTime: {
        seconds: Date.now() / 1000
      }
    },
    // Don't return time series data, instead just return information about
    // the metrics that match the filter
    view: `HEADERS`
  });
  const output = await runAsync(`${cmd} read-fields`, cwd);
  t.true(output.includes(`Found data points for the following instances:`));
  timeSeries.forEach((data) => {
    t.true(output.includes(data.metric.labels.instance_name));
  });
});

test(`should read time series data aggregated`, async (t) => {
  const [timeSeries] = await client.listTimeSeries({
    name: client.projectPath(projectId),
    filter: filter,
    interval: {
      startTime: {
        // Limit results to the last 20 minutes
        seconds: (Date.now() / 1000) - (60 * 20)
      },
      endTime: {
        seconds: Date.now() / 1000
      }
    },
    // Aggregate results per matching instance
    aggregation: {
      alignmentPeriod: {
        seconds: 600
      },
      perSeriesAligner: `ALIGN_MEAN`
    }
  });
  const output = await runAsync(`${cmd} read-aggregate`, cwd);
  t.true(output.includes(`CPU utilization:`));
  timeSeries.forEach((data) => {
    t.true(output.includes(data.metric.labels.instance_name));
    t.true(output.includes(`  Now: ${data.points[0].value.doubleValue}`));
    t.true(output.includes(`  10 min ago: ${data.points[1].value.doubleValue}`));
  });
});

test(`should read time series data reduced`, async (t) => {
  const [timeSeries] = await client.listTimeSeries({
    name: client.projectPath(projectId),
    filter: filter,
    interval: {
      startTime: {
        // Limit results to the last 20 minutes
        seconds: (Date.now() / 1000) - (60 * 20)
      },
      endTime: {
        seconds: Date.now() / 1000
      }
    },
    // Aggregate results per matching instance
    aggregation: {
      alignmentPeriod: {
        seconds: 600
      },
      crossSeriesReducer: `REDUCE_MEAN`,
      perSeriesAligner: `ALIGN_MEAN`
    }
  });
  const reductions = timeSeries[0].points;
  const output = await runAsync(`${cmd} read-reduce`, cwd);
  t.true(output.includes(`Average CPU utilization across all GCE instances:`));
  t.true(output.includes(`  Last 10 min: ${reductions[0].value.doubleValue}`));
  t.true(output.includes(`  10-20 min ago: ${reductions[0].value.doubleValue}`));
});
