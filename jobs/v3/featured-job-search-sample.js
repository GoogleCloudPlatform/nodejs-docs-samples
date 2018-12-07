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
const createAuthCredential = require(`./create-auth-credential`);
const sleep = require('./sleep');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/**
 * The sample in this file introduce featured job, including:
 *
 * - Construct a featured job
 *
 * - Search featured job
 */

// [START featured_job]

/**
 * Creates a job as featured.
 */
const generateFeaturedJob = companyName => {
  const requisitionId = `"featuredJob: ${new Date().getTime()}}`;
  const jobTitle = 'Software Engineer';
  const applicationUrls = ['http://careers.google.com'];
  const description =
    'Design, develop, test, deploy, maintain and improve software.';

  const job = {
    companyName: companyName,
    requisitionId: requisitionId,
    title: jobTitle,
    applicationInfo: {uris: applicationUrls},
    description: description,
    promotionValue: 2,
  };

  console.log(`Job generated: ${JSON.stringify(job)}`);
  return job;
};
// [END featured_job]

// [START search_featured_job]

/**
 * Searches featured jobs.
 */
const searchFeaturedJobs = async (jobServiceClient, companyName) => {
  try {
    const requestMetadata = {
      userId: 'HashedUserId',
      sessionId: 'HashedSessionId',
      domain: 'www.google.com',
    };

    const jobQuery = {
      query: 'Software Engineer',
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: requestMetadata,
        searchMode: 'FEATURED_JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END search_featured_job]

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

    // Create a job
    const jobToBeCreated = generateFeaturedJob(companyName);
    const jobCreated = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated
    );
    const jobName = jobCreated.name;

    // Wait several seconds for post processing
    await sleep(10000);

    // Search featured jobs
    await searchFeaturedJobs(jobServiceClient, companyName);

    // Delete job and company
    await basicJobSample.deleteJob(jobServiceClient, jobName);
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.log(e);
    throw e;
  }
})();
