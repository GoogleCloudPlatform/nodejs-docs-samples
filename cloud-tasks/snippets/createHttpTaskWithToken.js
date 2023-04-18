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
//   title: Cloud Tasks Create HTTP Target with Token
//   description: Create Cloud Tasks with a HTTP Target with Token
//   usage: node createHttpTaskWithToken.js <projectId> <queueName> <location> <url> <serviceAccountEmail> <payload> <delayInSeconds>

/**
 * Create a task with an HTTP target for a given queue with an arbitrary payload.
 */
function main(
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-queue', // Name of your Queue
  location = 'us-central1', // The GCP region of your queue
  url = 'https://example.com/taskhandler', // The full url path that the request will be sent to
  serviceAccountEmail = 'client@<project-id>.iam.gserviceaccount.com', // Cloud IAM service account
  payload = 'Hello, World!' // The task HTTP request body
) {
  // [START cloud_tasks_create_http_task_with_token]
  // Imports the Google Cloud Tasks library.
  const {CloudTasksClient} = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new CloudTasksClient();

  async function createHttpTaskWithToken() {
    // TODO(developer): Uncomment these lines and replace with your values.
    // const project = 'my-project-id';
    // const queue = 'my-queue';
    // const location = 'us-central1';
    // const url = 'https://example.com/taskhandler';
    // const serviceAccountEmail = 'client@<project-id>.iam.gserviceaccount.com';
    // const payload = 'Hello, World!';

    // Construct the fully qualified queue name.
    const parent = client.queuePath(project, location, queue);

    const task = {
      httpRequest: {
        headers: {
          'Content-Type': 'text/plain', // Set content type to ensure compatibility your application's request parsing
        },
        httpMethod: 'POST',
        url,
        oidcToken: {
          serviceAccountEmail,
        },
      },
    };

    if (payload) {
      task.httpRequest.body = Buffer.from(payload).toString('base64');
    }

    console.log('Sending task:');
    console.log(task);
    // Send create task request.
    const request = {parent: parent, task: task};
    const [response] = await client.createTask(request);
    const name = response.name;
    console.log(`Created task ${name}`);
  }
  createHttpTaskWithToken();
  // [END cloud_tasks_create_http_task_with_token]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
