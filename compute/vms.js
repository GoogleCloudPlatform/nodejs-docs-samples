// Copyright 2017 Google LLC
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

// [START complete]
'use strict';

// [START auth]
// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://cloud.google.com/docs/authentication/production#providing_credentials_to_your_application
const Compute = require('@google-cloud/compute');
// [END auth]

// [START initialize]
// Creates a client
const compute = new Compute();
// [END initialize]

// [START list]

async function getVmsExample() {
  // In this example we only want one VM per page
  const options = {
    maxResults: 1,
  };
  const vms = await compute.getVMs(options);
  return vms;
}
// [END list]
// [END complete]

// Run the examples
exports.main = async () => {
  const vms = await getVmsExample().catch(console.error);
  if (vms) console.log('VMs:', vms);
  return vms;
};

if (module === require.main) {
  exports.main(console.log);
}
