/**
 * Copyright 2016, Google, Inc.
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

// [START functions_log_helloworld]
exports.helloWorld = (req, res) => {
  console.log('I am a log entry!');
  console.error('I am an error!');
  res.end();
};
// [END functions_log_helloworld]

// [START functions_log_retrieve]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
const Logging = require('@google-cloud/logging');

function getLogEntries () {
  // Instantiates a client
  const logging = Logging();

  const options = {
    pageSize: 10,
    filter: 'resource.type="cloud_function"'
  };

  // Retrieve the latest Cloud Function log entries
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/logging
  return logging.getEntries(options)
    .then(([entries]) => {
      console.log('Entries:');
      entries.forEach((entry) => console.log(entry));
      return entries;
    });
}
// [END functions_log_retrieve]

// [START functions_log_get_metrics]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
const Monitoring = require('@google-cloud/monitoring');

function getMetrics (callback) {
  // Instantiates a client
  const monitoring = Monitoring.v3().metricServiceApi();

  // Create two datestrings, a start and end range
  let oneWeekAgo = new Date();
  oneWeekAgo.setHours(oneWeekAgo.getHours() - (7 * 24));

  const options = {
    name: monitoring.projectPath(process.env.GCLOUD_PROJECT),
    // There is also: cloudfunctions.googleapis.com/function/execution_count
    filter: 'metric.type="cloudfunctions.googleapis.com/function/execution_times"',
    interval: {
      startTime: {
        seconds: oneWeekAgo.getTime() / 1000
      },
      endTime: {
        seconds: Date.now() / 1000
      }
    },
    view: 1
  };

  console.log('Data:');

  let error;

  // Iterate over all elements.
  monitoring.listTimeSeries(options)
    .on('error', (err) => {
      error = err;
    })
    .on('data', (element) => console.log(element))
    .on('end', () => callback(error));
  // [END functions_log_get_metrics]
}

// [START functions_log_stackdriver]
exports.processLogEntry = (data) => {
  // Node 6: data.data === Node 8+: data
  const dataBuffer = Buffer.from(data.data.data || data.data, 'base64');

  const logEntry = JSON.parse(dataBuffer.toString('ascii')).protoPayload;
  console.log(`Method: ${logEntry.methodName}`);
  console.log(`Resource: ${logEntry.resourceName}`);
  console.log(`Initiator: ${logEntry.authenticationInfo.principalEmail}`);
};
// [END functions_log_stackdriver]

exports.getLogEntries = getLogEntries;
exports.getMetrics = getMetrics;
