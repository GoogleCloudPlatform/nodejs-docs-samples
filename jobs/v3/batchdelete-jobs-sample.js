/**
 * Copyright 2019, Google, LLC.
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
const customAttributeSample = require('./custom-attribute-sample');
const sleep = require('./sleep');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/**
 * The sample in this file introduces how to perform a batch delete of jobs.
 * NOTE: Both company name and requisition ID are required to perform batchDelete.
 */

// [START jobs_batchDelete]

/**
 * Batch delete jobs.
 * NOTE: @property [filter] formatting is strict. Do not change.
 */
const batchDelete = async (jobServiceClient, companyName, jobs) => {
  try {
    let batchDeleteQuery = `companyName = "${companyName}"`;
    jobs.forEach(job => {
      batchDeleteQuery += ` AND requisitionId = "${job.requisitionId}"`;
    });

    const request = {
      parent: `projects/${PROJECT_ID}`,
      requestBody: {
        filter: batchDeleteQuery,
      },
    };

    const result = await jobServiceClient.projects.jobs.batchDelete(request);
    console.log(JSON.stringify('Batch deleted.', result));
    return;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END jobs_batchDelete]

// [START list_jobs]

/**
 * List Jobs.
 * NOTE: @property [filter] formatting is strict. Do not change.
 */
const listJobs = async (jobServiceClient, companyName) => {
  try {
    const request = {
      parent: `projects/${PROJECT_ID}`,
      filter: `companyName = "${companyName}"`,
    };
    const jobsObj = await jobServiceClient.projects.jobs.list(request);

    console.log(JSON.stringify(jobsObj.data));
    return jobsObj.data.jobs;
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END list_jobs]

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

    // Create multiple jobs
    for (let i = 0; i < 5; i += 1) {
      const jobToBeCreated = customAttributeSample.generateJobWithACustomAttribute(
        companyName
      );
      await basicJobSample.createJob(jobServiceClient, jobToBeCreated);
    }

    // Wait several seconds for post processing
    await sleep(10000);

    // Get a list of jobs
    const jobs = await listJobs(jobServiceClient, companyName);

    // Batch delete jobs
    await batchDelete(jobServiceClient, companyName, jobs);
  } catch (e) {
    console.log(e);
    throw e;
  }
})();
