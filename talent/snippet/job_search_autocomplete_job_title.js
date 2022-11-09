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

'use strict';

// [START job_search_autocomplete_job_title]

const talent = require('@google-cloud/talent').v4;

/**
 * Complete job title given partial text (autocomplete)
 *
 * @param projectId {string} Your Google Cloud Project ID
 * @param tenantId {string} Identifier of the TenantId
 */
function sampleCompleteQuery(
  projectId,
  tenantId,
  query,
  numResults,
  languageCode
) {
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
  client
    .completeQuery(request)
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

// [END job_search_autocomplete_job_title]
// tslint:disable-next-line:no-any

const argv = require('yargs')
  .option('project_id', {
    default: 'Your Google Cloud Project ID',
    string: true,
  })
  .option('tenant_id', {
    default: 'Your Tenant ID (using tenancy is optional)',
    string: true,
  })
  .option('query', {
    default: '[partially typed job title]',
    string: true,
  })
  .option('num_results', {
    default: 5,
    number: true,
  })
  .option('language_code', {
    default: 'en-US',
    string: true,
  }).argv;

sampleCompleteQuery(
  argv.project_id,
  argv.tenant_id,
  argv.query,
  argv.num_results,
  argv.language_code
);
