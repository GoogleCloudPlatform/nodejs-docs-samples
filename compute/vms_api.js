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
const {google} = require('googleapis');
const compute = google.compute('v1');
// [END initialize]

// [START list]
/**
 * @param {Function} callback Callback function.
 */
async function getVmsExample() {
  const authClient = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/compute',
      'https://www.googleapis.com/auth/compute.readonly',
    ],
  });
  const projectId = await google.auth.getProjectId();

  // Retrieve the vms
  const result = await compute.instances.aggregatedList({
    auth: authClient,
    project: projectId,
    // In this example we only want one VM per page
    maxResults: 1,
  });
  const vms = result.data;
  console.log('VMs:', vms);
  return vms;
}
// [END list]
// [END complete]

// Run the examples
getVmsExample().catch(console.error);
