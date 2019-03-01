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
const REQUEST_META_DATA = {
  userId: 'HashedUserId',
  sessionId: 'HashedSessionId',
  domain: 'www.google.com',
};

/**
 * This file contains the samples about CustomAttribute, including:
 *
 * - Construct a Job with CustomAttribute
 *
 * - Search Job with CustomAttributeFilter
 */

// [START custom_attribute_job]

/**
 * Generate a job with a custom attribute.
 */
const generateJobWithACustomAttribute = companyName => {
  const requisitionId = `jobWithACustomAttribute: ${new Date().getTime()}`;
  const jobTitle = 'Software Engineer';
  const applicationUrls = ['http://careers.google.com'];
  const description =
    'Design, develop, test, deploy, maintain and improve software.';

  const customAttributes = {
    someFieldName1: {stringValues: ['value1'], filterable: true},
    someFieldName2: {longValues: [256], filterable: true},
  };

  const job = {
    companyName: companyName,
    requisitionId: requisitionId,
    title: jobTitle,
    applicationInfo: {uris: applicationUrls},
    description: description,
    customAttributes: customAttributes,
  };

  console.log(`Job generated: ${JSON.stringify(job)}`);
  return job;
};
// [END custom_attribute_job]

// [START custom_attribute_filter_string_value]

/**
 * CustomAttributeFilter on String value CustomAttribute
 */
const filtersOnStringValueCustomAttribute = async jobServiceClient => {
  try {
    const customAttributeFilter = 'NOT EMPTY(someFieldName1)';
    const jobQuery = {customAttributeFilter: customAttributeFilter};
    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        jobView: 'JOB_VIEW_FULL',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);
    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.log(e);
    throw e;
  }
};
// [END custom_attribute_filter_string_value]

// [START custom_attribute_filter_long_value]

/**
 * CustomAttributeFilter on Long value CustomAttribute
 */
const filtersOnLongValueCustomAttribute = async jobServiceClient => {
  try {
    const customAttributeFilter =
      '(255 <= someFieldName2) AND' + ' (someFieldName2 <= 257)';
    const jobQuery = {customAttributeFilter: customAttributeFilter};
    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        jobView: 'JOB_VIEW_FULL',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);
    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.log(e);
    throw e;
  }
};
// [END custom_attribute_filter_long_value]

// [START custom_attribute_filter_multi_attributes]

/**
 * CustomAttributeFilter on multiple CustomAttributes
 */
const filtersOnMultiCustomAttributes = async jobServiceClient => {
  try {
    const customAttributeFilter =
      '(someFieldName1 = "value1") AND ((255 <= someFieldName2) OR ' +
      '(someFieldName2 <= 213))';
    const jobQuery = {customAttributeFilter: customAttributeFilter};
    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        jobView: 'JOB_VIEW_FULL',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);
    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.log(e);
    throw e;
  }
};
// [END custom_attribute_filter_multi_attributes]

// Run Sample
const runSample = async () => {
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
    const jobToBeCreated = generateJobWithACustomAttribute(companyName);
    const jobCreated = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated
    );
    const jobName = jobCreated.name;

    // Wait several seconds for post processing
    await sleep(10000);

    await filtersOnStringValueCustomAttribute(jobServiceClient);
    await filtersOnLongValueCustomAttribute(jobServiceClient);
    await filtersOnMultiCustomAttributes(jobServiceClient);

    // Delete job and company
    await basicJobSample.deleteJob(jobServiceClient, jobName);
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.error(e);
    throw e;
  }
};

module.exports = {
  generateJobWithACustomAttribute: generateJobWithACustomAttribute,
  runSample: runSample,
};
