// Copyright 2019 Google LLC
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

// sample-metadata:
//   title: List Triggers.
//   description: List available build triggers.
//   usage: node list-build-triggers.js <PROJECT_ID>

// [START cloudbuild_list_build_triggers]
async function listBuildTriggers(
  projectId = 'YOUR_PROJECT_ID' // Your Google Cloud Platform project ID
) {
  // Imports the Google Cloud client library
  const {CloudBuildClient} = require('@google-cloud/cloudbuild');

  // Creates a client
  const cb = new CloudBuildClient();

  // What project should we list triggers for?
  const request = {
    projectId,
  };

  const [result] = await cb.listBuildTriggers(request);
  console.info(JSON.stringify(result, null, 2));
}
// [END cloudbuild_list_build_triggers]

const args = process.argv.slice(2);
listBuildTriggers(...args).catch(console.error);
