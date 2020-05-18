// DO NOT EDIT! This is a generated sample ("Request",  "job_search_get_job")
'use strict';

// [START job_search_get_job]
// [START job_search_get_job_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Get Job */
function sampleGetJob(projectId, tenantId, jobId) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const jobId = 'Job ID';
  const formattedName = client.jobPath(projectId, tenantId, jobId);
  client.getJob({name: formattedName})
    .then(responses => {
      const response = responses[0];
      console.log(`Job name: ${response.name}`);
      console.log(`Requisition ID: ${response.requisitionId}`);
      console.log(`Title: ${response.title}`);
      console.log(`Description: ${response.description}`);
      console.log(`Posting language: ${response.languageCode}`);
      for (const address of response.addresses) {
        console.log(`Address: ${address}`);
      }
      for (const email of response.applicationInfo.emails) {
        console.log(`Email: ${email}`);
      }
      for (const websiteUri of response.applicationInfo.uris) {
        console.log(`Website: ${websiteUri}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_get_job_core]
// [END job_search_get_job]
// tslint:disable-next-line:no-any

const argv = require(`yargs`)
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true
  })
  .option('tenant_id', {
    default: 'Your Tenant ID (using tenancy is optional)',
    string: true
  })
  .option('job_id', {
    default: 'Job ID',
    string: true
  })
  .argv;

sampleGetJob(argv.project_id, argv.tenant_id, argv.job_id);