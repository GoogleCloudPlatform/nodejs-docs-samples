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

// [START job_search_histogram_search]

const talent = require('@google-cloud/talent').v4;

/**
 * Search Jobs with histogram queries
 *
 * @param query {string} Histogram query
 * More info on histogram facets, constants, and built-in functions:
 * https://godoc.org/google.golang.org/genproto/googleapis/cloud/talent/v4beta1#SearchJobsRequest
 */
function sampleSearchJobs(projectId, tenantId, query) {
  const client = new talent.JobServiceClient();
  // Iterate over all elements.
  // const projectId = 'Your Google Cloud Project ID';
  // const tenantId = 'Your Tenant ID (using tenancy is optional)';
  // const query = 'count(base_compensation, [bucket(12, 20)])';
  const formattedParent = client.tenantPath(projectId, tenantId);
  const domain = 'www.example.com';
  const sessionId = 'Hashed session identifier';
  const userId = 'Hashed user identifier';
  const requestMetadata = {
    domain: domain,
    sessionId: sessionId,
    userId: userId,
  };
  const histogramQueriesElement = {
    histogramQuery: query,
  };
  const histogramQueries = [histogramQueriesElement];
  const request = {
    parent: formattedParent,
    requestMetadata: requestMetadata,
    histogramQueries: histogramQueries,
  };

  client
    .searchJobs(request)
    .then(responses => {
      const resources = responses[0];
      for (const resource of resources.matchingJobs) {
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

// [END job_search_histogram_search]
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
    default: 'count(base_compensation, [bucket(12, 20)])',
    string: true,
  }).argv;

sampleSearchJobs(argv.project_id, argv.tenant_id, argv.query);
