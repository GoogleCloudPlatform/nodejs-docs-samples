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
 * The samples in this file introduce how to do a search with location filter, including:
 *
 * - Basic search with location filter
 *
 * - Keyword search with location filter
 *
 * - Location filter on city level
 *
 * - Broadening search with location filter
 *
 * - Location filter of multiple locations
 */

// [START basic_location_search]

/**
 * Basic location Search
 */
const basicLocationSearch = async (
  jobServiceClient,
  companyName,
  location,
  distance
) => {
  try {
    const locationFilter = {
      address: location,
      distanceInMiles: distance,
    };

    const jobQuery = {
      locationFilters: [locationFilter],
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
// [END basic_location_search]

// [START keyword_location_search]

/**
 * Keyword location Search
 */
const keywordLocationSearch = async (
  jobServiceClient,
  companyName,
  location,
  distance,
  keyword
) => {
  try {
    const locationFilter = {
      address: location,
      distanceInMiles: distance,
    };

    const jobQuery = {
      locationFilters: [locationFilter],
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
// [END keyword_location_search]

// [START city_location_search]

/**
 * City location Search
 */
const cityLocationSearch = async (jobServiceClient, companyName, location) => {
  try {
    const locationFilter = {
      address: location,
    };

    const jobQuery = {
      locationFilters: [locationFilter],
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
// [END city_location_search]

// [START multi_locations_search]

/**
 * Multiple locations Search
 */
const multiLocationsSearch = async (
  jobServiceClient,
  companyName,
  location1,
  distance1,
  location2
) => {
  try {
    const locationFilter1 = {
      address: location1,
      distanceInMiles: distance1,
    };

    const locationFilter2 = {
      address: location2,
    };

    const jobQuery = {
      locationFilters: [locationFilter1, locationFilter2],
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
// [END multi_locations_search]

// [START broadening_location_search]

/**
 * Broadening location Search
 */
const broadeningLocationsSearch = async (
  jobServiceClient,
  companyName,
  location
) => {
  try {
    const locationFilter = {
      address: location,
    };

    const jobQuery = {
      locationFilters: [locationFilter],
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
        enable_broadening: true,
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END broadening_location_search]

// Run Sample
(async (...args) => {
  try {
    const location = args.length >= 1 ? args[0] : 'Mountain View, CA';
    const distance = args.length >= 2 ? parseFloat(args[1]) : 0.5;
    const keyword = args.length >= 3 ? args[2] : 'Software Engineer';
    const location2 = args.length >= 4 ? args[3] : 'Sunnyvale, CA';

    // Create an authorized client
    const jobServiceClient = await createAuthCredential();

    // Create a company
    const companyToBeCreated = basicCompanySample.generateCompany();
    const companyCreated = await basicCompanySample.createCompany(
      jobServiceClient,
      companyToBeCreated
    );
    const companyName = companyCreated.name;

    // Create two jobs
    const jobToBeCreated = basicJobSample.generateJobWithRequiredFields(
      companyName
    );
    jobToBeCreated.addresses = [location];
    jobToBeCreated.title = keyword;
    const jobCreated = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated
    );
    const jobName = jobCreated.name;

    const jobToBeCreated2 = basicJobSample.generateJobWithRequiredFields(
      companyName
    );
    jobToBeCreated.addresses = [location2];
    jobToBeCreated.title = keyword;
    const jobCreated2 = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated2
    );
    const jobName2 = jobCreated2.name;

    // Wait several seconds for post processing
    await sleep(10000);

    await basicLocationSearch(
      jobServiceClient,
      companyName,
      location,
      distance
    );
    await cityLocationSearch(jobServiceClient, companyName, location);
    await broadeningLocationsSearch(jobServiceClient, companyName, location);
    await keywordLocationSearch(
      jobServiceClient,
      companyName,
      location,
      distance,
      keyword
    );
    await multiLocationsSearch(
      jobServiceClient,
      companyName,
      location,
      distance,
      location2
    );

    // Delete jobs and company
    await basicJobSample.deleteJob(jobServiceClient, jobName);
    await basicJobSample.deleteJob(jobServiceClient, jobName2);
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.log(e);
    throw e;
  }
})();
