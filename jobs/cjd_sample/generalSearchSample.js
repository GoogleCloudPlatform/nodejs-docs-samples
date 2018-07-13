/**
 * Copyright 2018 Google LLC.
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
// [START generalSearchSample]

const assert = require('assert');
const getClient = require('./jobsClient.js').getClient;
const companySample = require('./basicCompanySample.js');
const jobSample = require('./basicJobSample.js');

// [START basic_keyword_search]
/**
 * Search jobs based on keyword.
 * @param {Object} client Instance of google.jobs module.
 * @param {Array} companyNames Array of company names.
 * @param {string} query Search query.
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function basicKeywordSearch (client, companyNames, query) {
  const jobQuery = {
    companyNames: companyNames,
    query: query
  };
  const searchRequestMetadata = {
    user_id: 'HashedUserId',
    session_id: 'HashedSessionID',
    domain: 'www.google.com'
  };

  return new Promise((resolve, reject) => {
    client.jobs.search({
      resource: {
        request_metadata: searchRequestMetadata,
        query: jobQuery,
        mode: 'JOB_SEARCH'
      }
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      resolve(response.data);
    });
  });
}
exports.basicKeywordSearch = basicKeywordSearch;
// [END basic_keyword_search]

/**
 * Main entry point function.
 */
function main () {
  getClient().then((jobsClient) => {
    assert(jobsClient, 'jobs instance not found.');

    companySample.createCompany(jobsClient, companySample.generateCompany()).then((companyInfo) => {
      const companyName = companyInfo.name;
      console.log('Company name:', companyName);

      const jobInfo = jobSample.generateJob(companyName);
      jobSample.createJob(jobsClient, jobInfo).then((info) => {
        // Wait for 10 secs for job to get indexed.
        setTimeout(() => {
          const query = 'System administrator';
          basicKeywordSearch(jobsClient, [companyName], query).then((result) => {
            assert(result.spellResult.correctedText === query);
            assert(result.matchingJobs.length === 1);
            assert(result.matchingJobs[0].job.jobTitle === query);
          });
        }, 10 * 1000);
      });
    });
  });
}

if (require.main === module) {
  main();
}
// [END generalSearchSample]
