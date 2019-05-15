/**
 * Copyright 2019, Google LLC
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

/**
 * Create a task with an HTTP target for a given queue with an arbitrary payload.
 */
async function createHttpTaskWithToken(
  project,
  location,
  queue,
  url,
  email,
  payload,
  inSeconds
) {
  // [START cloud_tasks_create_http_task_with_token]
  // Imports the Google Cloud Tasks library.
  const {v2beta3} = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new v2beta3.CloudTasksClient();

  // TODO(developer): Uncomment these lines and replace with your values.
  // const project = 'my-project-id';
  // const queue = 'my-queue';
  // const location = 'us-central1';
  // const url = 'https://example.com/taskhandler'
  // const email = 'client@<project-id>.iam.gserviceaccount.com'
  // const payload = 'hello';

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url, //The full url path that the request will be sent to.
      oidcToken: {
        serviceAccountEmail: email,
      },
    },
  };

  if (payload) {
    task.httpRequest.body = Buffer.from(payload).toString('base64');
  }

  if (inSeconds) {
    task.scheduleTime = {
      seconds: inSeconds + Date.now() / 1000,
    };
  }

  const request = {
    parent: parent,
    task: task,
  };

  console.log('Sending task:');
  console.log(task);
  // Send create task request.
  const [response] = await client.createTask(request);
  const name = response.name;
  console.log(`Created task ${name}`);

  // [END cloud_tasks_create_http_task_with_token]
}

createHttpTaskWithToken(...process.argv.slice(2)).catch(console.error);
