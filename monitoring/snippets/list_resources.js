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
 * @fileoverview Simple command-line program to demonstrate connecting to the
 * Stackdriver Monitoring API to retrieve API data.
 */
'use strict';

var google = require('googleapis');
var async = require('async');

var monitoringScopes = [
  'https://www.googleapis.com/auth/cloud-platform',
  'https://www.googleapis.com/auth/monitoring',
  'https://www.googleapis.com/auth/monitoring.read',
  'https://www.googleapis.com/auth/monitoring.write'
];

var METRIC = 'compute.googleapis.com/instance/cpu/usage_time';

/**
 * Returns an hour ago minus 5 minutes in RFC33339 format.
 */
function getStartTime () {
  var d = new Date();
  d.setHours(d.getHours() - 1);
  d.setMinutes(d.getMinutes() - 5);
  return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

/**
 * Returns an hour ago in RFC33339 format.
 */
function getEndTime () {
  var d = new Date();
  d.setHours(d.getHours() - 1);
  return JSON.parse(JSON.stringify(d).replace('Z', '000Z'));
}

var ListResources = {

  /**
   * This Lists all the resources available to be monitored in the API.
   *
   * @param {googleAuthClient} authClient - The authenticated Google api client
   * @param {String} projectId - the project id
   * @param {requestCallback} callback - a function to be called when the server
   *     responds with the list of monitored resource descriptors
   */
  listMonitoredResourceDescriptors: function (authClient, projectId, callback) {
    var monitoring = google.monitoring('v3');
    monitoring.projects.monitoredResourceDescriptors.list({
      auth: authClient,
      name: projectId,
      pageSize: 3
    }, function (err, monitoredResources) {
      if (err) {
        return callback(err);
      }

      console.log('Monitored resources', monitoredResources);
      callback(null, monitoredResources);
    });
  },

  /**
   * This Lists the metric descriptors that start with our METRIC name, in this
   * case the CPU usage time.
   * @param {googleAuthClient} authClient - The authenticated Google api client
   * @param {String} projectId - the project id
   * @param {requestCallback} callback - a function to be called when the server
   *     responds with the list of monitored resource descriptors
   */
  listMetricDescriptors: function (authClient, projectId, callback) {
    var monitoring = google.monitoring('v3');
    monitoring.projects.metricDescriptors.list({
      auth: authClient,
      filter: 'metric.type="' + METRIC + '"',
      pageSize: 3,
      name: projectId
    }, function (err, metricDescriptors) {
      if (err) {
        return callback(err);
      }

      console.log('Metric descriptors', metricDescriptors);
      callback(null, metricDescriptors);
    });
  },

  /**
   * This Lists all the timeseries created between START_TIME and END_TIME
   * for our METRIC.
   * @param {googleAuthClient} authClient - The authenticated Google api client
   * @param {String} projectId - the project id
   * @param {requestCallback} callback - a function to be called when the server
   *     responds with the list of monitored resource descriptors
   */
  listTimeseries: function (authClient, projectId, callback) {
    var monitoring = google.monitoring('v3');
    var startTime = getStartTime();
    var endTime = getEndTime();

    monitoring.projects.timeSeries.list({
      auth: authClient,
      filter: 'metric.type="' + METRIC + '"',
      pageSize: 3,
      'interval.startTime': startTime,
      'interval.endTime': endTime,
      name: projectId
    }, function (err, timeSeries) {
      if (err) {
        return callback(err);
      }

      console.log('Time series', timeSeries);
      callback(null, timeSeries);
    });
  },

  getMonitoringClient: function (callback) {
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
  }
};

exports.main = function (projectId, cb) {
  var projectName = 'projects/' + projectId;
  ListResources.getMonitoringClient(function (err, authClient) {
    if (err) {
      return cb(err);
    }
    // Create the service object.
    async.series([
      function (cb) {
        ListResources.listMonitoredResourceDescriptors(
          authClient,
          projectName,
          cb
        );
      },
      function (cb) {
        ListResources.listMetricDescriptors(
          authClient,
          projectName,
          cb
        );
      },
      function (cb) {
        ListResources.listTimeseries(
          authClient,
          projectName,
          cb
        );
      }
    ], cb);
  });
};

if (require.main === module) {
  var args = process.argv.slice(2);
  exports.main(
    args[0] || process.env.GCLOUD_PROJECT,
    console.log
  );
}
