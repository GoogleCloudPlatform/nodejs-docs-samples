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

// [START cloud_tasks_app_create_task]
const MAX_SCHEDULE_LIMIT = 30 * 60 * 60 * 24; // Represents 30 days in seconds.

const createHttpTaskWithToken = async function (
  project = 'my-project-id', // Your GCP Project id
  queue = 'my-queue', // Name of your Queue
  location = 'us-central1', // The GCP region of your queue
  url = 'https://example.com/taskhandler', // The full url path that the request will be sent to
  email = '<member>@<project-id>.iam.gserviceaccount.com', // Cloud IAM service account
  payload = 'Hello, World!', // The task HTTP request body
  date = new Date() // Intended date to schedule task
) {
  // Imports the Google Cloud Tasks library.
  const {v2beta3} = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new v2beta3.CloudTasksClient();

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  // Convert message to buffer.
  const convertedPayload = JSON.stringify(payload);
  const body = Buffer.from(convertedPayload).toString('base64');

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      oidcToken: {
        serviceAccountEmail: email,
        audience: new URL(url).origin,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      body,
    },
  };

  const convertedDate = new Date(date);
  const currentDate = new Date();

  // Schedule time can not be in the past.
  if (convertedDate < currentDate) {
    console.error('Scheduled date in the past.');
  } else if (convertedDate > currentDate) {
    const date_diff_in_seconds = (convertedDate - currentDate) / 1000;
    // Restrict schedule time to the 30 day maximum.
    if (date_diff_in_seconds > MAX_SCHEDULE_LIMIT) {
      console.error('Schedule time is over 30 day maximum.');
    }
    // Construct future date in Unix time.
    const date_in_seconds =
      Math.min(date_diff_in_seconds, MAX_SCHEDULE_LIMIT) + Date.now() / 1000;
    // Add schedule time to request in Unix time using Timestamp structure.
    // https://googleapis.dev/nodejs/tasks/latest/google.protobuf.html#.Timestamp
    task.scheduleTime = {
      seconds: date_in_seconds,
    };
  }

  try {
    // Send create task request.
    const [response] = await client.createTask({parent, task});
    console.log(`Created task ${response.name}`);
    return response.name;
  } catch (error) {
    // Construct error for Stackdriver Error Reporting
    console.error(Error(error.message));
  }
};

module.exports = createHttpTaskWithToken;
// [END cloud_tasks_app_create_task]
