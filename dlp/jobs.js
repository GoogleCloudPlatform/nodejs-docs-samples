/**
 * Copyright 2017, Google, Inc.
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

function listJobs(callingProjectId, filter, jobType) {
  // [START dlp_list_jobs]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The filter expression to use
  // For more information and filter syntax, see https://cloud.google.com/dlp/docs/reference/rest/v2/projects.dlpJobs/list
  // const filter = `state=DONE`;

  // The type of job to list (either 'INSPECT_JOB' or 'RISK_ANALYSIS_JOB')
  // const jobType = 'INSPECT_JOB';

  // Construct request for listing DLP scan jobs
  const request = {
    parent: dlp.projectPath(callingProjectId),
    filter: filter,
    type: jobType,
  };

  // Run job-listing request
  dlp
    .listDlpJobs(request)
    .then(response => {
      const jobs = response[0];
      jobs.forEach(job => {
        console.log(`Job ${job.name} status: ${job.state}`);
      });
    })
    .catch(err => {
      console.log(`Error in listJobs: ${err.message || err}`);
    });
  // [END dlp_list_jobs]
}

function deleteJob(jobName) {
  // [START dlp_delete_job]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The name of the job whose results should be deleted
  // Parent project ID is automatically extracted from this parameter
  // const jobName = 'projects/my-project/dlpJobs/X-#####'

  // Construct job deletion request
  const request = {
    name: jobName,
  };

  // Run job deletion request
  dlp
    .deleteDlpJob(request)
    .then(() => {
      console.log(`Successfully deleted job ${jobName}.`);
    })
    .catch(err => {
      console.log(`Error in deleteJob: ${err.message || err}`);
    });
  // [END dlp_delete_job]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `list <filter>`,
    `List Data Loss Prevention API jobs corresponding to a given filter.`,
    {
      jobType: {
        type: 'string',
        alias: 't',
        default: 'INSPECT',
      },
    },
    opts => listJobs(opts.callingProject, opts.filter, opts.jobType)
  )
  .command(
    `delete <jobName>`,
    `Delete results of a Data Loss Prevention API job.`,
    {},
    opts => deleteJob(opts.jobName)
  )
  .option('c', {
    type: 'string',
    alias: 'callingProject',
    default: process.env.GCLOUD_PROJECT || '',
  })
  .example(`node $0 list "state=DONE" -t RISK_ANALYSIS_JOB`)
  .example(`node $0 delete projects/YOUR_GCLOUD_PROJECT/dlpJobs/X-#####`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
