// DO NOT EDIT! This is a generated sample ("Request",  "job_search_batch_delete_job")
'use strict';

// [START job_search_batch_delete_job]
// [START job_search_batch_delete_job_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * Batch delete jobs using a filter
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenantd
 * @param filter {string} The filter string specifies the jobs to be deleted.
 * For example:
 * companyName = "projects/api-test-project/companies/123" AND equisitionId = "req-1"
 */
function sampleBatchDeleteJobs(projectId, tenantId, filter) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const filter = '[Query]';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const request = {
    parent: formattedParent,
    filter: filter,
  };
  client.batchDeleteJobs(request).catch(err => {
    console.error(err);
  });
  console.log(`Batch deleted jobs from filter`);
}


// [END job_search_batch_delete_job_core]
// [END job_search_batch_delete_job]
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
  .option('filter', {
    default: '[Query]',
    string: true
  })
  .argv;

sampleBatchDeleteJobs(argv.project_id, argv.tenant_id, argv.filter);