// DO NOT EDIT! This is a generated sample ("Request",  "job_search_delete_job")
'use strict';

// [START job_search_delete_job]
// [START job_search_delete_job_core]

const talent = require('@google-cloud/talent').v4beta1;

/** Delete Job */
function sampleDeleteJob(projectId, tenantId, jobId) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const jobId = 'Company ID';
  const formattedName = client.jobPath(projectId, tenantId, jobId);
  client.deleteJob({name: formattedName}).catch(err => {
    console.error(err);
  });
  console.log(`Deleted job.`);
}


// [END job_search_delete_job_core]
// [END job_search_delete_job]
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
    default: 'Company ID',
    string: true
  })
  .argv;

sampleDeleteJob(argv.project_id, argv.tenant_id, argv.job_id);