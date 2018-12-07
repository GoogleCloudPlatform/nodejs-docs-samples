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
 * The samples in this file introduce how to do a commute search.
 *
 * Note: Commute Search is different from location search. It only take latitude and longitude as
 * the start location.
 */

// [START commute_search]
const commuteSearch = async (jobServiceClient, companyName) => {
  try {
    const requestMetadata = {
      userId: 'HashedUserId',
      sessionId: 'HashedSessionId',
      domain: 'www.google.com',
    };

    const startLocation = {
      latitude: 37.422408,
      longitude: -122.085609,
    };

    const commutePreference = {
      roadTraffic: 'TRAFFIC_FREE',
      commuteMethod: 'TRANSIT',
      travelDuration: '1000s',
      startCoordinates: startLocation,
    };

    const jobQuery = {
      commuteFilter: commutePreference,
    };

    if (companyName) {
      jobQuery.companyNames = [companyName];
    }

    const request = {
      parent: `projects/${PROJECT_ID}`,
      resource: {
        jobQuery: jobQuery,
        requestMetadata: requestMetadata,
        jobView: 'JOB_VIEW_FULL',
        requirePreciseResultSize: true,
      },
    };

    const result = await jobServiceClient.projects.jobs.search(request);

    console.log(JSON.stringify(result.data));
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// [END commute_search]

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
    jobToBeCreated.addresses = [
      '1600 Amphitheatre Parkway, Mountain View, CA 94043',
    ];
    const jobCreated = await basicJobSample.createJob(
      jobServiceClient,
      jobToBeCreated
    );
    const jobName = jobCreated.name;

    // Wait several seconds for post processing
    await sleep(10000);

    // Commute search
    await commuteSearch(jobServiceClient, companyName);

    // Delete job and company
    await basicJobSample.deleteJob(jobServiceClient, jobName);
    await basicCompanySample.deleteCompany(jobServiceClient, companyName);
  } catch (e) {
    console.log(e);
    throw e;
  }
})();
