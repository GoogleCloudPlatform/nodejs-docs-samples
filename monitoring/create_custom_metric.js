// Copyright 2015, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Simple command-line program to demonstrate creating a custom
 * metric with the Stackdriver Monitoring API, writing a random value to it,
 * and reading it back.
 */
'use strict';

/* jshint camelcase: false */

var google = require('googleapis');
var async = require('async');

var monitoringScopes = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/monitoring',
  'https://www.googleapis.com/auth/monitoring.read',
  'https://www.googleapis.com/auth/monitoring.write'
];

/**
 * Returns the current timestamp in RFC33339 with milliseconds format.
 */
function getNow () {
  var d = new Date();
  return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

/**
 * Returns an hour ago in RFC33339 with milliseconds format. This is used
 * to start the window to view the metric written in.
 */
function getStartTime () {
  var d = new Date();
  d.setHours(d.getHours() - 1);
  return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

var CUSTOM_METRIC_DOMAIN = 'custom.googleapis.com';

/**
 * Constructor function. The CustomMetrics class stores the type of metric
 * in its instance class allowing unique ones to be used in tests.
 */
function CustomMetrics (projectName, metricType) {
  this.projectResource = 'projects/' + projectName;
  this.metricType = CUSTOM_METRIC_DOMAIN + '/' + metricType;
  this.metricName = this.projectResource +
    '/metricDescriptors/' + this.metricType;
  this.valueOverride = false;
}

/**
 * Creates a custom metric. For demonstration purposes, this is a hypothetical
 * measurement (measured in the 'items' unit, with random values written to
 * it.
 * @param {Object} authClient The authorized Monitoring client.
 * @param {Function} callback Callback function.
 */
CustomMetrics.prototype.createCustomMetric = function (client, callback) {
  var monitoring = google.monitoring('v3');

  monitoring.projects.metricDescriptors.create({
    auth: client,
    name: this.projectResource,
    resource: {
      name: this.metricName,
      type: this.metricType,
      labels: [
        {
          key: 'environment',
          valueType: 'STRING',
          description: 'An abritrary measurement'
        }
      ],
      metricKind: 'GAUGE',
      valueType: 'INT64',
      unit: 'items',
      description: 'An arbitrary measurement.',
      displayName: 'Custom Metric'
    }
  }, function (err, customMetric) {
    if (err) {
      return callback(err);
    }

    console.log('Created custom metric', customMetric);
    callback(null, customMetric);
  });
};

/**
 * Writes a time series value for the custom metric just created. It uses a
 * GAUGE measurement which indicates the value at this point in time. For
 * demonstration purposes, this is a random value. For GAUGE measurements,
 * the start time and end time of the value must be the same. The
 * resource for this value is a hypothetical GCE instance.
 * @param {Object} authClient The authorized Stackdriver Monitoring API client
 * @param {Function} callback Callback Function.
 */
CustomMetrics.prototype.writeTimeSeriesForCustomMetric =
  function (client, callback) {
    var monitoring = google.monitoring('v3');
    var now = getNow();

    monitoring.projects.timeSeries.create({
      auth: client,
      name: this.projectResource,
      resource: {
        timeSeries: [{
          metric: {
            type: this.metricType,
            labels: {
              environment: 'production'
            }
          },
          resource: {
            type: 'gce_instance',
            labels: {
              instance_id: 'test_instance',
              zone: 'us-central1-f'
            }
          },
          points: {
            interval: {
              startTime: now,
              endTime: now
            },
            value: {
              int64Value: this.getRandomInt(1, 20)
            }
          }
        }]
      }
    }, function (err, timeSeries) {
      if (err) {
        return callback(err);
      }

      console.log('Wrote time series', timeSeries);
      callback(null, timeSeries);
    });
  };

/**
 * Lists the time series written for the custom metric. The window
 * to read the timeseries starts an hour ago and extends unti the current
 * time, so should include the metric value written by
 * the earlier calls.
 * @param {Object} authClient The authorized Stackdriver Monitoring API client
 * @param {Function} callback Callback function.
 */
CustomMetrics.prototype.listTimeSeries = function (client, callback) {
  var monitoring = google.monitoring('v3');
  var startTime = getStartTime();
  var endTime = getNow();

  console.log('Reading metric type', this.metricType);

  monitoring.projects.timeSeries.list({
    auth: client,
    name: this.projectResource,
    filter: 'metric.type="' + this.metricType + '"',
    pageSize: 3,
    'interval.startTime': startTime,
    'interval.endTime': endTime
  }, function (err, timeSeries) {
    if (err) {
      return callback(err);
    }

    console.log('Time series', timeSeries);
    callback(null, timeSeries);
  });
};

/**
 * @param {Object} authClient The authorized Stackdriver Monitoring API client
 * @param {Function} callback Callback function.
 */
CustomMetrics.prototype.deleteMetric = function (client, callback) {
  var monitoring = google.monitoring('v3');

  console.log(this.metricName);
  monitoring.projects.metricDescriptors.delete({
    auth: client,
    name: this.metricName
  }, function (err, result) {
    if (err) {
      return callback(err);
    }

    console.log('Deleted metric', result);
    callback(null, result);
  });
};

/**
 * Gets random integer between low and high (exclusive). Used to fill in
 * a random value for the measurement.
 */
CustomMetrics.prototype.getRandomInt = function (low, high) {
  return Math.floor(Math.random() * (high - low) + low);
};

CustomMetrics.prototype.getMonitoringClient = function (callback) {
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // Depending on the environment that provides the default credentials
    // (e.g. Compute Engine, App Engine), the credentials retrieved may
    // require you to specify the scopes you need explicitly.
    // Check for this case, and inject the Cloud Storage scope if required.
    if (authClient.createScopedRequired &&
      authClient.createScopedRequired()) {
      authClient = authClient.createScoped(monitoringScopes);
    }
    callback(null, authClient);
  });
};

// Run the examples
exports.main = function (projectId, name, cb) {
  var customMetrics = new CustomMetrics(projectId, name);
  customMetrics.getMonitoringClient(function (err, authClient) {
    if (err) {
      return cb(err);
    }
    // Create the service object.
    async.series([
      function (cb) {
        customMetrics.createCustomMetric(authClient, cb);
      },
      function (cb) {
        setTimeout(function () {
          customMetrics.writeTimeSeriesForCustomMetric(authClient, cb);
        }, 10000);
      },
      function (cb) {
        setTimeout(function () {
          customMetrics.listTimeSeries(authClient, cb);
        }, 10000);
      },
      function (cb) {
        customMetrics.deleteMetric(authClient, cb);
      }
    ], cb);
  });
};

if (require.main === module) {
  var args = process.argv.slice(2);
  exports.main(
    args[0] || process.env.GCLOUD_PROJECT,
    args[1] || 'custom_measurement',
    console.log
  );
}
