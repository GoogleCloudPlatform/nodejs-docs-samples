// Copyright 2020 Google LLC
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
//  title: List jobs
//  description: List Data Loss Prevention API jobs corresponding to a given filter.
//  usage: node listJobs.js my-project filter jobType

function main(projectId, filter, jobType) {
  // [START dlp_list_jobs]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The filter expression to use
  // For more information and filter syntax, see https://cloud.google.com/dlp/docs/reference/rest/v2/projects.dlpJobs/list
  // const filter = `state=DONE`;

  // The type of job to list (either 'INSPECT_JOB' or 'RISK_ANALYSIS_JOB')
  // const jobType = 'INSPECT_JOB';
  async function listJobs() {
    // Construct request for listing DLP scan jobs
    const request = {
      parent: `projects/${projectId}/locations/global`,
      filter: filter,
      type: jobType,
    };

    // Run job-listing request
    const [jobs] = await dlp.listDlpJobs(request);
    jobs.forEach(job => {
      console.log(`Job ${job.name} status: ${job.state}`);
    });
  }

  listJobs();
  // [END dlp_list_jobs]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
