// DO NOT EDIT! This is a generated sample ("RequestAsyncPagedAll",  "job_search_custom_ranking_search")
'use strict';

// [START job_search_custom_ranking_search]
// [START job_search_custom_ranking_search_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * Search Jobs using custom rankings
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenantd
 */
function sampleSearchJobs(projectId, tenantId) {
  const client = new talent.JobServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const domain = 'www.example.com';
  const sessionId = 'Hashed session identifier';
  const userId = 'Hashed user identifier';
  const requestMetadata = {
    domain: domain,
    sessionId: sessionId,
    userId: userId,
  };
  const importanceLevel = 'EXTREME';
  const rankingExpression = '(someFieldLong + 25) * 0.25';
  const customRankingInfo = {
    importanceLevel: importanceLevel,
    rankingExpression: rankingExpression,
  };
  const orderBy = 'custom_ranking desc';
  const request = {
    parent: formattedParent,
    requestMetadata: requestMetadata,
    customRankingInfo: customRankingInfo,
    orderBy: orderBy,
  };

  client.searchJobs(request)
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources) {
        console.log(`Job summary: ${resource.jobSummary}`);
        console.log(`Job title snippet: ${resource.jobTitleSnippet}`);
        const job = resource.job;
        console.log(`Job name: ${job.name}`);
        console.log(`Job title: ${job.title}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_custom_ranking_search_core]
// [END job_search_custom_ranking_search]
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
  .argv;

sampleSearchJobs(argv.project_id, argv.tenant_id);