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

/**
 * This application demonstrates how to perform basic operations on metrics with
 * the Google Stackdriver Monitoring API.
 *
 * For more information, see the README.md under /monitoring and the
 * documentation at https://cloud.google.com/monitoring/docs.
 */

'use strict';

function createMetricDescriptor (projectId) {
  // [START monitoring_create_metric]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

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
          description: 'The ID of the store.'
        }
      ]
    }
  };

  // Creates a custom metric descriptor
  client.createMetricDescriptor(request)
    .then((results) => {
      const descriptor = results[0];

      console.log('Created custom Metric:\n');
      console.log(`Name: ${descriptor.displayName}`);
      console.log(`Description: ${descriptor.description}`);
      console.log(`Type: ${descriptor.type}`);
      console.log(`Kind: ${descriptor.metricKind}`);
      console.log(`Value Type: ${descriptor.valueType}`);
      console.log(`Unit: ${descriptor.unit}`);
      console.log('Labels:');
      descriptor.labels.forEach((label) => {
        console.log(`  ${label.key} (${label.valueType}) - ${label.description}`);
      });
    });
  // [END monitoring_create_metric]
}

function listMetricDescriptors (projectId) {
  // [START monitoring_list_descriptors]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  const request = {
    name: client.projectPath(projectId)
  };

  // Lists metric descriptors
  client.listMetricDescriptors(request)
    .then((results) => {
      const descriptors = results[0];

      console.log('Metric Descriptors:');
      descriptors.forEach((descriptor) => console.log(descriptor.name));
    });
  // [END monitoring_list_descriptors]
}

function getMetricDescriptor (projectId, metricId) {
  // [START monitoring_get_descriptor]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  // An example of "metricId" is "logging.googleapis.com/log_entry_count"
  // const metricId = 'some/metric/id';

  const request = {
    name: client.metricDescriptorPath(projectId, metricId)
  };

  // Retrieves a metric descriptor
  client.getMetricDescriptor(request)
    .then((results) => {
      const descriptor = results[0];

      console.log(`Name: ${descriptor.displayName}`);
      console.log(`Description: ${descriptor.description}`);
      console.log(`Type: ${descriptor.type}`);
      console.log(`Kind: ${descriptor.metricKind}`);
      console.log(`Value Type: ${descriptor.valueType}`);
      console.log(`Unit: ${descriptor.unit}`);
      console.log('Labels:');
      descriptor.labels.forEach((label) => {
        console.log(`  ${label.key} (${label.valueType}) - ${label.description}`);
      });
    });
  // [END monitoring_get_descriptor]
}

function deleteMetricDescriptor (projectId, metricId) {
  // [START monitoring_delete_metric]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  // The ID of the Metric Descriptor to delete, e.g.
  // const metricId = 'custom.googleapis.com/stores/daily_sales';

  const request = {
    name: client.metricDescriptorPath(projectId, metricId)
  };

  // Deletes a metric descriptor
  client.deleteMetricDescriptor(request)
    .then((results) => {
      console.log(`Deleted ${metricId}`);
    });
  // [END monitoring_delete_metric]
}

function writeTimeSeriesData (projectId, metricId) {
  // [START monitoring_write_timeseries]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  const dataPoint = {
    interval: {
      endTime: {
        seconds: Date.now() / 1000
      }
    },
    value: {
      doubleValue: 123.45
    }
  };

  const timeSeriesData = {
    metric: {
      type: 'custom.googleapis.com/stores/daily_sales',
      labels: {
        store_id: 'Pittsburgh'
      }
    },
    resource: {
      type: 'global',
      labels: {
        project_id: projectId
      }
    },
    points: [
      dataPoint
    ]
  };

  const request = {
    name: client.projectPath(projectId),
    timeSeries: [
      timeSeriesData
    ]
  };

  // Writes time series data
  client.createTimeSeries(request)
    .then((results) => {
      console.log(`Done writing time series data.`);
    });
  // [END monitoring_write_timeseries]
}

function readTimeSeriesData (projectId, filter) {
  // [START monitoring_read_timeseries_simple]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  // An example "filter" is 'metric.type="compute.googleapis.com/instance/cpu/utilization"'
  // const filter = 'metric.type="compute.googleapis.com/instance/cpu/utilization"';

  const request = {
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
  };

  // Writes time series data
  client.listTimeSeries(request)
    .then((results) => {
      const timeSeries = results[0];

      timeSeries.forEach((data) => {
        console.log(`${data.metric.labels.instance_name}:`);
        data.points.forEach((point) => {
          console.log(JSON.stringify(point.value));
        });
      });
    });
  // [END monitoring_read_timeseries_simple]
}

function readTimeSeriesFields (projectId) {
  // [START monitoring_read_timeseries_fields]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  const request = {
    name: client.projectPath(projectId),
    filter: 'metric.type="compute.googleapis.com/instance/cpu/utilization"',
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
    view: 'HEADERS'
  };

  // Writes time series data
  client.listTimeSeries(request)
    .then((results) => {
      const timeSeries = results[0];

      console.log('Found data points for the following instances:');
      timeSeries.forEach((data) => {
        console.log(data.metric.labels.instance_name);
      });
    });
  // [END monitoring_read_timeseries_fields]
}

function readTimeSeriesAggregate (projectId) {
  // [START monitoring_read_timeseries_align]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  const request = {
    name: client.projectPath(projectId),
    filter: 'metric.type="compute.googleapis.com/instance/cpu/utilization"',
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
      perSeriesAligner: 'ALIGN_MEAN'
    }
  };

  // Writes time series data
  client.listTimeSeries(request)
    .then((results) => {
      const timeSeries = results[0];

      console.log('CPU utilization:');
      timeSeries.forEach((data) => {
        console.log(data.metric.labels.instance_name);
        console.log(`  Now: ${data.points[0].value.doubleValue}`);
        console.log(`  10 min ago: ${data.points[1].value.doubleValue}`);
      });
    });
  // [END monitoring_read_timeseries_align]
}

function readTimeSeriesReduce (projectId) {
  // [START monitoring_read_timeseries_reduce]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  const request = {
    name: client.projectPath(projectId),
    filter: 'metric.type="compute.googleapis.com/instance/cpu/utilization"',
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
      crossSeriesReducer: 'REDUCE_MEAN',
      perSeriesAligner: 'ALIGN_MEAN'
    }
  };

  // Writes time series data
  client.listTimeSeries(request)
    .then((results) => {
      const reductions = results[0][0].points;

      console.log('Average CPU utilization across all GCE instances:');
      console.log(`  Last 10 min: ${reductions[0].value.doubleValue}`);
      console.log(`  10-20 min ago: ${reductions[0].value.doubleValue}`);
    });
  // [END monitoring_read_timeseries_reduce]
}

function listMonitoredResourceDescriptors (projectId) {
  // [START monitoring_list_resources]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  const request = {
    name: client.projectPath(projectId)
  };

  // Lists monitored resource descriptors
  client.listMonitoredResourceDescriptors(request)
    .then((results) => {
      const descriptors = results[0];

      console.log('Monitored Resource Descriptors:');
      descriptors.forEach((descriptor) => console.log(descriptor.name));
    });
  // [END monitoring_list_resources]
}

function getMonitoredResourceDescriptor (projectId, resourceType) {
  // [START monitoring_get_resource]
  // Imports the Google Cloud client library
  const Monitoring = require('@google-cloud/monitoring');

  // Instantiates a client
  const client = Monitoring.v3().metricServiceClient();

  // The Google Cloud Platform project on which to execute the request
  // const projectId = 'YOUR_PROJECT_ID';

  // "resourceType" should be a predefined type, such as "cloudsql_database"
  // const resourceType = 'some_resource_type';

  const request = {
    name: client.monitoredResourceDescriptorPath(projectId, resourceType)
  };

  // Lists monitored resource descriptors
  client.getMonitoredResourceDescriptor(request)
    .then((results) => {
      const descriptor = results[0];

      console.log(`Name: ${descriptor.displayName}`);
      console.log(`Description: ${descriptor.description}`);
      console.log(`Type: ${descriptor.type}`);
      console.log('Labels:');
      descriptor.labels.forEach((label) => {
        console.log(`  ${label.key} (${label.valueType}) - ${label.description}`);
      });
    });
  // [END monitoring_get_resource]
}

const cli = require(`yargs`)
  .demand(1)
  .command(
    `create [projectId]`,
    `Creates an example 'custom.googleapis.com/stores/daily_sales' custom metric descriptor.`,
    {},
    (opts) => createMetricDescriptor(opts.projectId)
  )
  .command(
    `list [projectId]`,
    `Lists metric descriptors.`,
    {},
    (opts) => listMetricDescriptors(opts.projectId)
  )
  .command(
    `get <metricId> [projectId]`,
    `Get a metric descriptor.`,
    {},
    (opts) => getMetricDescriptor(opts.projectId, opts.metricId)
  )
  .command(
    `delete <metricId> [projectId]`,
    `Deletes a custom metric descriptor.`,
    {},
    (opts) => deleteMetricDescriptor(opts.projectId, opts.metricId)
  )
  .command(
    `write [projectId]`,
    `Writes example time series data to 'custom.googleapis.com/stores/daily_sales'.`,
    {},
    (opts) => writeTimeSeriesData(opts.projectId)
  )
  .command(
    `read <filter> [projectId]`,
    `Reads time series data that matches the given filter.`,
    {},
    (opts) => readTimeSeriesData(opts.projectId, opts.filter)
  )
  .command(
    `read-fields [projectId]`,
    `Reads headers of time series data that matches 'compute.googleapis.com/instance/cpu/utilization'.`,
    {},
    (opts) => readTimeSeriesFields(opts.projectId)
  )
  .command(
    `read-aggregate [projectId]`,
    `Aggregates time series data that matches 'compute.googleapis.com/instance/cpu/utilization'.`,
    {},
    (opts) => readTimeSeriesAggregate(opts.projectId)
  )
  .command(
    `read-reduce [projectId]`,
    `Reduces time series data that matches 'compute.googleapis.com/instance/cpu/utilization'.`,
    {},
    (opts) => readTimeSeriesReduce(opts.projectId)
  )
  .command(
    `list-resources [projectId]`,
    `Lists monitored resource descriptors.`,
    {},
    (opts) => listMonitoredResourceDescriptors(opts.projectId)
  )
  .command(
    `get-resource <resourceType> [projectId]`,
    `Get a monitored resource descriptor.`,
    {},
    (opts) => getMonitoredResourceDescriptor(opts.projectId, opts.resourceType)
  )
  .options({
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT,
      global: true,
      requiresArg: true,
      type: 'string'
    }
  })
  .example(`node $0 create`)
  .example(`node $0 list`)
  .example(`node $0 get logging.googleapis.com/log_entry_count`)
  .example(`node $0 delete custom.googleapis.com/stores/daily_sales`)
  .example(`node $0 list-resources`)
  .example(`node $0 get-resource cloudsql_database`)
  .example(`node $0 write`)
  .example(`node $0 read 'metric.type="compute.googleapis.com/instance/cpu/utilization"'`)
  .example(`node $0 read-fields`)
  .example(`node $0 read-aggregate`)
  .example(`node $0 read-reduce`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/monitoring/docs`);

if (module === require.main) {
  cli.help().strict().argv;
}
