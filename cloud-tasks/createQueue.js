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
 * Create a new Task Queue
 */
async function createQueue(
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-appengine-queue', // Name of the Queue to create
  location = 'us-central1' // The GCP region in which to create the queue
) {
  // Imports the Google Cloud Tasks library.
  const cloudTasks = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new cloudTasks.CloudTasksClient();

  // Send create queue request.
  const [response] = await client.createQueue({
    // The fully qualified path to the location where the queue is created
    parent: client.locationPath(project, location),
    queue: {
      // The fully qualified path to the queue
      name: client.queuePath(project, location, queue),
      appEngineHttpQueue: {
        appEngineRoutingOverride: {
          // The App Engine service that will receive the tasks.
          service: 'default',
        },
      },
    },
  });
  console.log(`Created queue ${response.name}`);
}

const args = process.argv.slice(2);
createQueue(...args).catch(console.error);
