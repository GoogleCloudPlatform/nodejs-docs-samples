// Copyright 2023 Google LLC
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

// This is a generated sample, using the typeless sample bot. Please
// look for the source TypeScript sample (.ts) for modifications.

// sample-metadata:
//   title: Create Job
//   description: Create a job that posts to /log_payload on an App Engine service.
//   usage: node createJob.js [project-id] [location-id] [app-engine-service-id]
const args = process.argv.slice(2);
const [projectId, locationId, serviceId] = args;
// [START cloudscheduler_create_job]
import { CloudSchedulerClient } from '@google-cloud/scheduler';
// TODO(developer): Uncomment and set the following variables
// const projectId = "PROJECT_ID"
// const locationId = "LOCATION_ID"
// const serviceId = "my-serivce"
// Create a client.
const client = new CloudSchedulerClient();
/**
 * Create a job with an App Engine target via the Cloud Scheduler API
 */
async function createJob(projectId, locationId, serviceId) {
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
            body: Buffer.from('Hello World'),
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
}
createJob(projectId, locationId, serviceId).catch(err => {
    console.error(err.message);
    process.exitCode = 1;
});
// [END cloudscheduler_create_job]
