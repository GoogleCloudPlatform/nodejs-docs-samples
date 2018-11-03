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

// [START complete]
// [START initialize]
const google = require('googleapis').google;
const compute = google.compute('v1');
// [END initialize]

// [START auth]
async function auth() {
  const data = await google.auth.getApplicationDefault();
  let authClient = data.credential;
  const projectId = authClient.projectId;

  // The createScopedRequired method returns true when running on GAE or a
  // local developer machine. In that case, the desired scopes must be passed
  // in manually. When the code is  running in GCE or GAE Flexible, the scopes
  // are pulled from the GCE metadata server.
  // See https://cloud.google.com/compute/docs/authentication for more
  // information.
  if (authClient.createScopedRequired && authClient.createScopedRequired()) {
    // Scopes can be specified either as an array or as a single,
    // space-delimited string.
    authClient = authClient.createScoped([
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/compute',
      'https://www.googleapis.com/auth/compute.readonly',
    ]);
    authClient.projectId = projectId;
  }

  return authClient;
}
// [END auth]

// [START list]
/**
 * @param {Function} callback Callback function.
 */
async function getVmsExample() {
  const authClient = await auth();

  // Retrieve the vms
  const vms = await compute.instances.aggregatedList({
    auth: authClient,
    project: authClient.projectId,
    // In this example we only want one VM per page
    maxResults: 1,
  });
  console.log('VMs:', vms);
  return vms;
}
// [END list]
// [END complete]

// Run the examples
getVmsExample().catch(console.error);
