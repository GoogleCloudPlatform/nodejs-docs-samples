/**
 * Copyright 2018 Google LLC.
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

const uuidv1 = require('uuid/v1');
const test = require('ava');
const tools = require('@google-cloud/nodejs-repo-tools');
const companySample = require('../basicCompanySample.js');
const getClient = require('../jobsClient.js').getClient;

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

let client;
let companyName;
let companyInfo = {
  displayName: 'Acme Inc',
  distributorCompanyId: 'company:' + uuidv1(),
  hqLocation: '1 Oak Street, Palo Alto, CA 94020'
};

test.serial('create client', (t) => {
  return getClient().then((jobs) => {
    client = jobs;
    t.truthy(client);
  });
});

test.serial('create a company', (t) => {
  return companySample.createCompany(client, companyInfo).then((info) => {
    t.is(info.displayName, companyInfo.displayName);
    t.is(info.displayName, companyInfo.displayName);
    t.is(info.hqLocation, companyInfo.hqLocation);
    companyName = info.name;
    t.truthy(companyName);
  });
});

test.serial('get a company', (t) => {
  return companySample.getCompany(client, companyName).then((info) => {
    t.is(info.name, companyName);
  });
});

test.serial('update a company', (t) => {
  companyInfo.companySize = 'SMALL';
  companyInfo.website = 'https://www.testabc.com';
  return companySample.updateCompany(client, companyName, companyInfo).then((info) => {
    t.is(info.companySize, companyInfo.companySize);
    t.is(info.website, companyInfo.website);
  });
});

test.serial('delete a company', (t) => {
  return companySample.deleteCompany(client, companyName).then((info) => {
    t.truthy(companyName);
  });
});
