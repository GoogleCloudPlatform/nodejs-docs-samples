// Copyright 2016, Google, Inc.
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

'use strict';

// [START log]
exports.helloWorld = function helloWorld (context, data) {
  console.log('I am a log entry!');
  context.success();
};
// [END log]

exports.retrieve = function retrieve () {
  // [START retrieve]
  // By default, the client will authenticate using the service account file
  // specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
  // the project specified by the GCLOUD_PROJECT environment variable. See
  // https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
  var Logging = require('@google-cloud/logging');

  // Instantiate a logging client
  var logging = Logging();

  // Retrieve the latest Cloud Function log entries
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/logging
  logging.getEntries({
    pageSize: 10,
    filter: 'resource.type="cloud_function"'
  }, function (err, entries) {
    if (err) {
      console.error(err);
    } else {
      console.log(entries);
    }
  });
  // [END retrieve]
};

exports.getMetrics = function getMetrics () {
  // [START getMetrics]
  var google = require('googleapis');
  var monitoring = google.monitoring('v3');

  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return console.error('Authentication failed', err);
    }
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      var scopes = [
        'https://www.googleapis.com/auth/cloud-platform',
        'https://www.googleapis.com/auth/monitoring',
        'https://www.googleapis.com/auth/monitoring.read',
        'https://www.googleapis.com/auth/monitoring.write'
      ];
      authClient = authClient.createScoped(scopes);
    }

    // Format a date according to RFC33339 with milliseconds format
    function formatDate (date) {
      return JSON.parse(JSON.stringify(date).replace('Z', '000Z'));
    }

    // Create two datestrings, a start and end range
    var oneWeekAgo = new Date();
    var now = new Date();
    oneWeekAgo.setHours(oneWeekAgo.getHours() - (7 * 24));
    oneWeekAgo = formatDate(oneWeekAgo);
    now = formatDate(now);

    monitoring.projects.timeSeries.list({
      auth: authClient,
      // There is also cloudfunctions.googleapis.com/function/execution_count
      filter: 'metric.type="cloudfunctions.googleapis.com/function/execution_times"',
      pageSize: 10,
      'interval.startTime': oneWeekAgo,
      'interval.endTime': now,
      name: 'projects/' + process.env.GCLOUD_PROJECT
    }, function (err, results) {
      if (err) {
        console.error(err);
      } else {
        console.log(results.timeSeries);
      }
    });
  });
  // [END getMetrics]
};
