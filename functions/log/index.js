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
  // By default, gcloud will authenticate using the service account file specified
  // by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
  // project specified by the GCLOUD_PROJECT environment variable. See
  // https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
  var gcloud = require('gcloud');
  var logging = gcloud.logging();

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
}
