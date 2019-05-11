// DO NOT EDIT! This is a generated sample ("Request",  "job_search_create_job_custom_attributes")
'use strict';

// [START job_search_create_job_custom_attributes]
// [START job_search_create_job_custom_attributes_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * Create Job with Custom Attributes
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenantd
 */
function sampleCreateJob(projectId, tenantId, companyName, requisitionId, languageCode) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const companyName = 'Company name, e.g. projects/your-project/companies/company-id';
  // const requisitionId = 'Job requisition ID, aka Posting ID. Unique per job.';
  // const languageCode = 'en-US';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const job = {
    company: companyName,
    requisitionId: requisitionId,
    languageCode: languageCode,
  };
  const request = {
    parent: formattedParent,
    job: job,
  };
  client.createJob(request)
    .then(responses => {
      const response = responses[0];
      console.log(`Created job: ${response.name}`);
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_create_job_custom_attributes_core]
// [END job_search_create_job_custom_attributes]
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
  .option('company_name', {
    default: 'Company name, e.g. projects/your-project/companies/company-id',
    string: true
  })
  .option('requisition_id', {
    default: 'Job requisition ID, aka Posting ID. Unique per job.',
    string: true
  })
  .option('language_code', {
    default: 'en-US',
    string: true
  })
  .argv;

sampleCreateJob(argv.project_id, argv.tenant_id, argv.company_name, argv.requisition_id, argv.language_code);