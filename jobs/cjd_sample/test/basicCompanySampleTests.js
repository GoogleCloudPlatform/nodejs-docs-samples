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
 * Unit tests for basicCompanySample.js
 * DEPENDENCIES:
 * You need to install mocha to run this test.
 * npm install mocha
 * 
 * Before running test:
 * export GOOGLE_APPLICATION_CREDENTIALS=<path to credentials json file>
 * 
 * Run test:
 * <path to node_modules>/mocha/bin/mocha basicCompanySampleTests.js
 */
const assert = require('assert');
const companySample = require('../basicCompanySample.js');

describe('Company API', () => {
    let companyInfo = {
        displayName: 'Acme Inc',
        distributorCompanyId: 'company:' + Math.floor(Math.random() * 100000).toString(),
        hqLocation: '1 Oak Street, Palo Alto, CA 94105'
    };
    // Client instance.
    let client;
    let companyName;
    it('can get client instance', () => {
        return companySample.getClient().then((jobs) => {
            client = jobs;
        });
    });
    
    it('can create a company', () => {
        return companySample.createCompany(client, companyInfo).then((info) => {
            assert(companyInfo.displayName === info.displayName);
            assert(companyInfo.distributorCompanyId === info.distributorCompanyId);
            assert(companyInfo.hqLocation === info.hqLocation);
            companyName = info.name;
        });
    });

    it('can get a company', () => {
        return companySample.getCompany(client, companyName).then((info) => {
            assert(companyName === info.name);
        });
    });

    it('can update a company', () => {
        companyInfo.companySize = 'SMALL';
        companyInfo.website = 'https://www.testabc.com';
        return companySample.updateCompany(client, companyName, companyInfo).then((info) => {
            assert(companyInfo.companySize === info.companySize);
            assert(companyInfo.website === info.website);
        });
    });

    it('can delete a company', () => {
        return companySample.deleteCompany(client, companyName);
    });
});