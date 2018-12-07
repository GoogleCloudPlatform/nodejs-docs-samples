/**
 * Copyright 2018, Google, LLC.
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

const basicCompanySample = require(`./basic-company-sample`);
const basicJobSample = require(`./basic-job-sample`);
const createAuthCredential = require('./create-auth-credential');
const sleep = require('./sleep');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/**
 * The sample in this file introduce how to do a email alert search.
 */

// [START search_for_alerts]

/**
 * Search jobs for alert.
 */
const searchForAlerts = async (jobServiceClient, companyName) => {
  try {
    const requestMetadata = {
      userId: 'HashedUserId',
      sessionId: 'HashedSessionId',
      domain: 'www.google.com',
    };

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        searchMode: 'JOB_SEARCH',
        requestMetadata: requestMetadata,
      },
    };

    if (companyName) {
      request.resource.jobQuery = {companyNames: [companyName]};
    }

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END search_for_alerts]

// Run Sample
(async () => {
  try {
    // Create an authorized client
    const jobServiceClient = await createAuthCredential();

    // Create a company
    const companyToBeCreated = basicCompanySample.generateCompany();
    const companyCreated = await basicCompanySample.createCompany(
      jobServiceClient,
      companyToBeCreated
    );
    const companyName = companyCreated.name;

    // Construct a job
    const jobToBeCreated = basicJobSample.generateJobWithRequiredFields(
      companyName
    );
    jobToBeCreated.title = 'Software engineer';
    const jobCreated = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated
    );
    const jobName = jobCreated.name;

    // Wait several seconds for post processing
    await sleep(10000);
    await searchForAlerts(jobServiceClient, companyName);

    // Delete job and company
    await basicJobSample.deleteJob(jobServiceClient, jobName);
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.error(e);
    throw e;
  }
})();
