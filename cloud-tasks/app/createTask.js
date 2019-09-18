/**
 * Copyright 2019 Google LLC
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

async function createHttpTaskWithToken(
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-queue', // Name of your Queue
  location = 'us-central1', // The GCP region of your queue
  url = 'https://example.com/taskhandler', // The full url path that the request will be sent to
  email = '<member>@<project-id>.iam.gserviceaccount.com', // Cloud IAM service account
  payload = 'Hello, World!', // The task HTTP request body
  date = Date.now() // Date to schedule task
) {
  // Imports the Google Cloud Tasks library.
  const {v2beta3} = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new v2beta3.CloudTasksClient();

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  // Convert message to buffer
  const converted_payload = JSON.stringify(payload);
  const body = Buffer.from(converted_payload).toString('base64');

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      oidcToken: {
        serviceAccountEmail: email,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
  };

  // Calculate time to send message
  const converted_date = new Date(date);
  const current_date = new Date(Date.now());

  if (converted_date < current_date) {
    console.error('Scheduled date in the past.');
  } else if (converted_date > current_date) {
    const seconds_diff = (converted_date - current_date) / 1000;
    // 30 day maximum for schedule time
    const add_seconds =
      Math.min(seconds_diff, 30 * 60 * 60 * 24) + Date.now() / 1000;
    // Add schedule time if after current date
    task.scheduleTime = {
      seconds: add_seconds,
    };
  }

  const request = {
    parent: parent,
    task: task,
  };

  // Send create task request.
  try {
    const [response] = await client.createTask(request);
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    console.error(error.message);
  }
}

module.exports = createHttpTaskWithToken;
