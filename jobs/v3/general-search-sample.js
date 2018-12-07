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
const REQUEST_META_DATA = {
  userId: 'HashedUserId',
  sessionId: 'HashedSessionId',
  domain: 'www.google.com',
};

/**
 * The samples in this file introduce how to do a general search, including:
 *
 * - Basic keyword search
 *
 * - Filter on categories
 *
 * - Filter on employment types
 *
 * - Filter on date range
 *
 * - Filter on language codes
 *
 * - Filter on company display names
 *
 * - Filter on compensations
 */

//[START basic_keyword_search]

/**
 * Simple search jobs with keyword.
 */
const basicKeywordSearch = async (jobServiceClient, companyName, keyword) => {
  try {
    const jobQuery = {
      query: keyword,
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
//[END basic_keyword_search]

// [START category_filter]

/**
 * Search on category filter.
 */
const categoryFilterSearch = async (
  jobServiceClient,
  companyName,
  categories
) => {
  try {
    const jobQuery = {
      jobCategories: categories,
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
//[END category_filter]

// [START employment_types_filter]

/**
 * Search on employment types.
 */
const employmentTypesSearch = async (
  jobServiceClient,
  companyName,
  employmentTypes
) => {
  try {
    const jobQuery = {
      employmentTypes: employmentTypes,
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
//[END employment_types_filter]

// [START date_range_filter]

/**
 * Search on date range. In JSON format, the Timestamp type is encoded as a string in the [RFC
 * 3339](https://www.ietf.org/rfc/rfc3339.txt) format. That is, the format is
 * "{year}-{month}-{day}T{hour}:{min}:{sec}[.{frac_sec}]Z" e.g. "2017-01-15T01:30:15.01Z"
 */
const dateRangeSearch = async (
  jobServiceClient,
  companyName,
  startTime,
  endTime
) => {
  try {
    const jobQuery = {
      publishTimeRange: {
        startTime: startTime,
        endTime: endTime,
      },
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
//[END date_range_filter]

// [START language_code_filter]

/**
 * Search on language codes.
 */
const languageCodeSearch = async (
  jobServiceClient,
  companyName,
  languageCodes
) => {
  try {
    const jobQuery = {
      languageCodes: languageCodes,
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END language_code_filter]

// [START company_display_name_filter]

/**
 * Search on company display name.
 */
const companyDisplayNameSearch = async (
  jobServiceClient,
  companyName,
  companyDisplayNames
) => {
  try {
    const jobQuery = {
      companyDisplayNames: companyDisplayNames,
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END company_display_name_filter]

// [START compensation_filter]

/**
 * Search on compensation.
 */
const compensationSearch = async (jobServiceClient, companyName) => {
  try {
    const compensationRange = {
      maxCompensation: {currencyCode: 'USD', units: 15},
      minCompensation: {currencyCode: 'USD', units: 10, nanos: 500000000},
    };

    const compensationFilter = {
      type: 'UNIT_AND_AMOUNT',
      units: ['HOURLY'],
      range: compensationRange,
    };

    const jobQuery = {compensationFilter: compensationFilter};

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: REQUEST_META_DATA,
        searchMode: 'JOB_SEARCH',
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END compensation_filter]

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
    const jobToBeCreated = basicJobSample.generateJobWithRequiredFields(
      companyName
    );
    jobToBeCreated.title = 'Systems Administrator';
    jobToBeCreated.employmentTypes = ['FULL_TIME'];
    jobToBeCreated.languageCode = 'en-US';
    const amount = {
      currencyCode: 'USD',
      units: 12,
    };
    jobToBeCreated.compensationInfo = {
      entries: [
        {
          type: 'BASE',
          unit: 'HOURLY',
          amount: amount,
        },
      ],
    };

    const jobCreated = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated
    );
    const jobName = jobCreated.name;

    // Wait several seconds for post processing
    await sleep(10000);

    // Search featured jobs
    await basicKeywordSearch(
      jobServiceClient,
      companyName,
      'Systems Administrator'
    );
    await categoryFilterSearch(jobServiceClient, companyName, [
      'COMPUTER_AND_IT',
    ]);
    await dateRangeSearch(
      jobServiceClient,
      companyName,
      '1980-01-15T01:30:15.01Z',
      '2099-01-15T01:30:15.01Z'
    );
    await employmentTypesSearch(jobServiceClient, companyName, [
      'FULL_TIME',
      'CONTRACTOR',
      'PER_DIEM',
    ]);
    await companyDisplayNameSearch(jobServiceClient, companyName, ['Google']);
    await compensationSearch(jobServiceClient, companyName);
    await languageCodeSearch(jobServiceClient, companyName, ['pt-BR', 'en-US']);

    // Delete job and company
    await basicJobSample.deleteJob(jobServiceClient, jobName);
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.log(e);
    throw e;
  }
})();
