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

// [START cloud_tasks_list_queues]
async function listQueues(
  project = 'my-project-id', // Your GCP Project id
  location = 'us-central1' // The GCP region to search for queues
) {
  // Imports the Google Cloud Tasks library.
  const cloudTasks = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new cloudTasks.CloudTasksClient();

  // Get the fully qualified path to the region
  const parent = client.locationPath(project, location);

  // list all fo the queues
  const [queues] = await client.listQueues({parent});

  if (queues.length > 0) {
    console.log('Queues:');
    queues.forEach(queue => {
      console.log(`  ${queue.name}`);
    });
  } else {
    console.log('No queues found!');
  }
}
// [END cloud_tasks_list_queues]

const args = process.argv.slice(2);
listQueues(...args).catch(console.error);
