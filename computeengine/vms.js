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

// [START complete]
'use strict';

// [START auth]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Compute = require('@google-cloud/compute');
// [END auth]

// [START initialize]
// Instantiate a compute client
var compute = Compute();
// [END initialize]

// [START list]
/**
 * @param {Function} callback Callback function.
 */
function getVmsExample (callback) {
  // In this example we only want one VM per page
  var options = {
    maxResults: 1
  };
  compute.getVMs(options, function (err, vms) {
    if (err) {
      return callback(err);
    }

    console.log('VMs:', vms);
    callback(null, vms);
  });
}
// [END list]
// [END complete]

// Run the examples
exports.main = function (cb) {
  getVmsExample(cb);
};

if (module === require.main) {
  exports.main(console.log);
}
