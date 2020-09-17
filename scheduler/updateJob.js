// Copyright 2020 Google LLC
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

// sample-metadata:
//   title: Update Job
//   description: Update a job by its ID.
//   usage: node updateJob.js [project-id] [location-id] [job-id]

async function updateJob(projectId, locationId, jobId) {
  const scheduler = require('@google-cloud/scheduler');

  // Create a client.
  const client = new scheduler.CloudSchedulerClient();

  // TODO(developer): Uncomment and set the following variables
  // const projectId = "PROJECT_ID"
  // const locationId = "LOCATION_ID"
  // const jobId = "JOB_ID"

  // Construct the fully qualified location path.
  const job = client.jobPath(projectId, locationId, jobId);

  // Construct the request body.
  const request = {
    job: {
      name: job,
      description: 'Hello World example.',
    },
    updateMask: {
      paths: ['description'],
    },
  };

  // Use the client to send the job update request.
  const [response] = await client.updateJob(request);
  console.log(`Updated job: ${response.name}`);
}

const args = process.argv.slice(2);
updateJob(...args).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
