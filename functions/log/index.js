// Copyright 2016 Google LLC
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
// https://github.com/googleapis/google-cloud-node/blob/master/docs/authentication.md
const Logging = require('@google-cloud/logging');

const getLogEntries = async () => {
  // Instantiates a client
  const logging = Logging();

  const options = {
    pageSize: 10,
    filter: 'resource.type="cloud_function"',
  };

  // Retrieve the latest Cloud Function log entries
  // See https://googlecloudplatform.github.io/gcloud-node/#/docs/logging
  const [entries] = await logging.getEntries(options);

  console.log('Entries:');
  entries.forEach((entry) => console.log(entry));
  return entries;
};
// [END functions_log_retrieve]

// [START functions_log_stackdriver]
exports.processLogEntry = (data) => {
  const dataBuffer = Buffer.from(data.data, 'base64');

  const logEntry = JSON.parse(dataBuffer.toString('ascii')).protoPayload;
  console.log(`Method: ${logEntry.methodName}`);
  console.log(`Resource: ${logEntry.resourceName}`);
  console.log(`Initiator: ${logEntry.authenticationInfo.principalEmail}`);
};
// [END functions_log_stackdriver]

exports.getLogEntries = getLogEntries;
