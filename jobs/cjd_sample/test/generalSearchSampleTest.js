/**
 * Copyright 2017, Google, Inc.
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

/**
 * Unit tests for basicJobSample.js
 * DEPENDENCIES:
 * You need to install mocha to run this test.
 * npm install mocha
 * 
 * Before running test:
 * export GOOGLE_APPLICATION_CREDENTIALS=<path to credentials json file>
 * 
 * Run test:
 * <path to node_modules>/mocha/bin/mocha basicJobSampleTests.js
 */
const assert = require('assert');
const companySample = require('../basicCompanySample.js');
const jobSample = require('../basicJobSample.js');
const generalSearchSample = require('../generalSearchSample.js');
const getClient = require('../jobsClient.js').getClient;

describe('Search API', () => {
    let companyInfo = {
        displayName: 'Acme Inc',
        distributorCompanyId: 'company:' + Math.floor(Math.random() * 100000).toString(),
        hqLocation: '1 Oak Street, Palo Alto, CA 94105'
    };
    let jobInfo;

    // Client instance.
    let client;
    let companyName, jobName;

    it('can get client instance', () => {
        return getClient().then((jobs) => {
            client = jobs;
        });
    });

    it('create a company', () => {
        return companySample.createCompany(client, companyInfo).then((info) => {
            companyName = info.name;
            jobInfo = jobSample.generateJob(companyName);
        });
    });
    
    it('create a job', () => {
        return jobSample.createJob(client, jobInfo).then((info) => {
            assert(jobInfo.jobTitle === info.jobTitle);
            assert(jobInfo.description === info.description);
            assert(companyName === info.companyName);
            jobName = info.name;
        });
    });

    it('can search a job by keyword', () => {
        const query = 'System administrator';
        return generalSearchSample.basicKeywordSearch(client, [companyName], query).then((result) => {
            assert(result.spellResult.correctedText === 'System administrator');
            assert(result.metadata.mode === 'JOB_SEARCH');
            assert(result.metadata.requestId);
        });
    });
});