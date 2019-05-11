// DO NOT EDIT! This is a generated sample ("Request",  "job_search_create_job")
'use strict';

// [START job_search_create_job]
// [START job_search_create_job_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * Create Job
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenant
 */
function sampleCreateJob(projectId, tenantId, companyName, requisitionId, title, description, jobApplicationUrl, addressOne, addressTwo, languageCode) {
  const client = new talent.JobServiceClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const companyName = 'Company name, e.g. projects/your-project/companies/company-id';
  // const requisitionId = 'Job requisition ID, aka Posting ID. Unique per job.';
  // const title = 'Software Engineer';
  // const description = 'This is a description of this <i>wonderful</i> job!';
  // const jobApplicationUrl = 'https://www.example.org/job-posting/123';
  // const addressOne = '1600 Amphitheatre Parkway, Mountain View, CA 94043';
  // const addressTwo = '111 8th Avenue, New York, NY 10011';
  // const languageCode = 'en-US';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const uris = [jobApplicationUrl];
  const applicationInfo = {
    uris: uris,
  };
  const addresses = [addressOne, addressTwo];
  const job = {
    company: companyName,
    requisitionId: requisitionId,
    title: title,
    description: description,
    applicationInfo: applicationInfo,
    addresses: addresses,
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


// [END job_search_create_job_core]
// [END job_search_create_job]
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
  .option('title', {
    default: 'Software Engineer',
    string: true
  })
  .option('description', {
    default: 'This is a description of this <i>wonderful</i> job!',
    string: true
  })
  .option('job_application_url', {
    default: 'https://www.example.org/job-posting/123',
    string: true
  })
  .option('address_one', {
    default: '1600 Amphitheatre Parkway, Mountain View, CA 94043',
    string: true
  })
  .option('address_two', {
    default: '111 8th Avenue, New York, NY 10011',
    string: true
  })
  .option('language_code', {
    default: 'en-US',
    string: true
  })
  .argv;

sampleCreateJob(argv.project_id, argv.tenant_id, argv.company_name, argv.requisition_id, argv.title, argv.description, argv.job_application_url, argv.address_one, argv.address_two, argv.language_code);