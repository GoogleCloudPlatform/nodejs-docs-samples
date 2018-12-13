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
const createAuthCredential = require(`./create-auth-credential`);

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

/**
 * This file contains the basic knowledge about job, including:
 *
 * - Construct a job with required fields
 *
 * - Create a job
 *
 * - Get a job
 *
 * - Update a job
 *
 * - Update a job with field mask
 *
 * - Delete a job
 */

// [START basic_job]

/**
 * Generate a basic job with given companyName.
 */
const generateJobWithRequiredFields = companyName => {
  const applicationUris = ['http://careers.google.com'];
  const description =
    'Design, develop, test, deploy, maintain and improve software.';
  const jobTitle = 'Software Engineer';
  const requisitionId = `jobWithRequiredFields:${new Date().getTime()}`;

  const job = {
    requisitionId: requisitionId,
    title: jobTitle,
    applicationInfo: {uris: applicationUris},
    description: description,
    companyName: companyName,
  };

  console.log(`Job generated: ${JSON.stringify(job)}`);
  return job;
};
// [END basic_job]

// [START create_job]

/**
 * Create a job.
 */
const createJob = async (jobServiceClient, jobToBeCreated) => {
  try {
    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        job: jobToBeCreated,
      },
    };

    const jobCreated = await jobServiceClient.projects.jobs.create(request);

    console.log(`Job created: ${JSON.stringify(jobCreated.data)}`);
    return jobCreated.data;
  } catch (e) {
    console.error(`Got exception while creating job!`);
    throw e;
  }
};
// [END create_job]

// [START get_job]

/**
 * Get a job.
 */
const getJob = async (jobServiceClient, jobName) => {
  try {
    const request = {
      name: jobName,
    };

    const jobExisted = await jobServiceClient.projects.jobs.get(request);

    console.log(`Job existed: ${JSON.stringify(jobExisted.data)}`);
    return jobExisted.data;
  } catch (e) {
    console.error('Got exception while getting job');
    throw e;
  }
};
// [END get_job]

// [START update_job]

/**
 * Update a job.
 */
const updateJob = async (jobServiceClient, jobName, jobToBeUpdated) => {
  try {
    const request = {
      name: jobName,
      resource: {
        job: jobToBeUpdated,
      },
    };

    const jobUpdated = await jobServiceClient.projects.jobs.patch(request);

    console.log(`Job updated: ${JSON.stringify(jobUpdated.data)}`);
    return jobUpdated.data;
  } catch (e) {
    console.error(`Got exception while updating job!`);
    throw e;
  }
};
// [END update_job]

// [START update_job_with_field_mask]

/**
 * Update a job with field mask.
 */
const updateJobWithFieldMask = async (
  jobServiceClient,
  jobName,
  jobToBeUpdated,
  fieldMask
) => {
  try {
    const request = {
      name: jobName,
      resource: {
        job: jobToBeUpdated,
        updateMask: fieldMask,
      },
    };

    const jobUpdated = await jobServiceClient.projects.jobs.patch(request);

    console.log(`Job updated: ${JSON.stringify(jobUpdated.data)}`);
    return jobUpdated.data;
  } catch (e) {
    console.error(`Got exception while updating job with field mask!`);
    throw e;
  }
};
// [END update_job_with_field_mask]

// [START delete_job]

/**
 * Delete a job.
 */
const deleteJob = async (jobServiceClient, jobName) => {
  try {
    const request = {
      name: jobName,
    };

    await jobServiceClient.projects.jobs.delete(request);
    console.log('Job deleted');
  } catch (e) {
    console.error('Got exception while deleting job');
    throw e;
  }
};
// [END delete_job]

// Run Sample
const runSample = async () => {
  try {
    // Create an authorized client
    const jobServiceClient = await createAuthCredential();

    // Create a company before creating jobs
    const companyToBeCreated = basicCompanySample.generateCompany();
    const companyCreated = await basicCompanySample.createCompany(
      jobServiceClient,
      companyToBeCreated
    );
    const companyName = companyCreated.name;

    // Construct a job
    const jobToBeCreated = generateJobWithRequiredFields(companyName);

    // Create a job
    const jobCreated = await createJob(jobServiceClient, jobToBeCreated);

    // Get a job
    const jobName = jobCreated.name;
    await getJob(jobServiceClient, jobName);

    // Update a job
    let jobToBeUpdated = jobCreated;
    jobToBeUpdated.description = 'changedDescription';
    await updateJob(jobServiceClient, jobName, jobToBeUpdated);

    // Update a job with field mask
    jobToBeUpdated = {
      title: 'changedJobTitle',
    };
    const fieldMask = 'title';
    await updateJobWithFieldMask(
      jobServiceClient,
      jobName,
      jobToBeUpdated,
      fieldMask
    );

    // Delete a job
    await deleteJob(jobServiceClient, jobName);

    // Delete company only after cleaning all jobs under this company
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.log(e);
    throw e;
  }
};

module.exports = {
  generateJobWithRequiredFields: generateJobWithRequiredFields,
  createJob: createJob,
  deleteJob: deleteJob,
  runSample: runSample,
};
