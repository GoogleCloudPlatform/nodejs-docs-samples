// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * Delete a given Queue
 */
async function deleteQueue(
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-appengine-queue', // Name of the Queue to delete
  location = 'us-central1' // The GCP region in which to delete the queue
) {
  // Imports the Google Cloud Tasks library.
  const cloudTasks = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new cloudTasks.CloudTasksClient();

  // Get the fully qualified path to the queue
  const name = client.queuePath(project, location, queue);

  // Send delete queue request.
  await client.deleteQueue({name});
  console.log(`Deleted queue '${queue}'.`);
}

const args = process.argv.slice(2);
deleteQueue(...args).catch(console.error);
