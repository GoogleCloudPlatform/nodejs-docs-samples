// DO NOT EDIT! This is a generated sample ("Request",  "job_search_autocomplete_job_title")
'use strict';

// [START job_search_autocomplete_job_title]
// [START job_search_autocomplete_job_title_core]

const talent = require('@google-cloud/talent').v4beta1;

/**
 * Complete job title given partial text (autocomplete)
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the Tenantd
 */
function sampleCompleteQuery(projectId, tenantId, query, numResults, languageCode) {
  const client = new talent.CompletionClient();
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const query = '[partially typed job title]';
  // const numResults = 5;
  // const languageCode = 'en-US';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const languageCodes = [languageCode];
  const request = {
    parent: formattedParent,
    query: query,
    pageSize: numResults,
    languageCodes: languageCodes,
  };
  client.completeQuery(request)
    .then(responses => {
      const response = responses[0];
      for (const result of response.completionResults) {
        console.log(`Suggested title: ${result.suggestion}`);
        // Suggestion type is JOB_TITLE or COMPANY_TITLE
        console.log(`Suggestion type: ${result.type}`);
      }
    })
    .catch(err => {
      console.error(err);
    });
}


// [END job_search_autocomplete_job_title_core]
// [END job_search_autocomplete_job_title]
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
  .option('query', {
    default: '[partially typed job title]',
    string: true
  })
  .option('num_results', {
    default: 5,
    number: true
  })
  .option('language_code', {
    default: 'en-US',
    string: true
  })
  .argv;

sampleCompleteQuery(argv.project_id, argv.tenant_id, argv.query, argv.num_results, argv.language_code);