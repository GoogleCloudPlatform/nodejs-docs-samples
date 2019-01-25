/**
 * Copyright 2018, Google LLC
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

/**
 * Create a job with an App Engine target via the Cloud Scheduler API
 */
async function createJob(projectId, locationId, serviceId) {
  // [START cloud_scheduler_create_job]
  const scheduler = require('@google-cloud/scheduler');

  // Create a client.
  const client = new scheduler.CloudSchedulerClient();

  // TODO(developer): Uncomment and set the following variables
  // const projectId = "PROJECT_ID"
  // const locationId = "LOCATION_ID"
  // const serviceId = "my-serivce"

  // Construct the fully qualified location path.
  const parent = client.locationPath(projectId, locationId);

  // Construct the request body.
  const job = {
    appEngineHttpTarget: {
      appEngineRouting: {
        service: serviceId,
      },
      relativeUri: '/log_payload',
      httpMethod: 'POST',
      body: Buffer.from('Hello World'), //.toString("base64"),
    },
    schedule: '* * * * *',
    timeZone: 'America/Los_Angeles',
  };

  const request = {
    parent: parent,
    job: job,
  };

  // Use the client to send the job creation request.
  const [response] = await client.createJob(request);
  console.log(`Created job: ${response.name}`);
  // [END cloud_scheduler_create_job]
}

const args = process.argv.slice(2);
createJob(...args).catch(console.error);
