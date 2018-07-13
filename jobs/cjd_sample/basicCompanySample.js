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

// [START basicCompanySample]

const assert = require('assert');
const uuidv1 = require('uuid/v1');
const getClient = require('./jobsClient.js').getClient;

// [START basic_company]
/**
 * Generate data for a company.
 * @returns {Object} Object containing fields of 'Company' resource.
 */
function generateCompany () {
  return {
    displayName: 'Google',
    distributorCompanyId: 'company:' + uuidv1(),
    hqLocation: '1600 Amphitheatre Parkway Mountain View, CA 94043'
  };
}
exports.generateCompany = generateCompany;
// [END basic_company]

// [START create_company]
/**
 * Create a new company.
 * @param {Object} client Instance of google.jobs module.
 * @param {Object} companyInfo Object containing fields of 'Company' resource.
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function createCompany (client, companyInfo) {
  assert(companyInfo, '\'companyInfo\' argument is required.');
  // Check required fields.
  assert(companyInfo.displayName, '\'displayName\' field is required.');
  assert(companyInfo.distributorCompanyId, '\'distributorCompanyId\' field is required.');

  return new Promise((resolve, reject) => {
    client.companies.create({
      resource: companyInfo
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      assert(response.data, '\'data\' field not populated in response.');
      resolve(response.data);
    });
  });
}
// [END create_company]
exports.createCompany = createCompany;

// [START get_company]
/**
 * Get a company.
 * @param {Object} client Instance of google.jobs module.
 * @param {string} companyName Name of company (value of 'name' field).
 * @returns {Promise.Object} Promise containing 'data' field of response.
 */
function getCompany (client, companyName) {
  assert(companyName, 'companyName argument is required.');
  return new Promise((resolve, reject) => {
    client.companies.get({
      name: companyName
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      resolve(response.data);
    });
  });
}
// [END get_company]
exports.getCompany = getCompany;

// [START update_company]
/**
 * Update a company.
 * @param {Object} client Instance of google.jobs module.
 * @param {string} companyName Name of company (value of 'name' field).
 * @param {*} companyInfo Object containing fields of 'Company' resource.
 */
function updateCompany (client, companyName, companyInfo) {
  assert(companyName, '\'companyName\' argument is required.');
  assert(companyInfo, '\'companyInfo\' argument is required.');

  return new Promise((resolve, reject) => {
    client.companies.patch({
      name: companyName,
      resource: companyInfo
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      resolve(response.data);
    });
  });
}
// [END update_company]
exports.updateCompany = updateCompany;

// [START delete_company]
/**
 * Delete a company.
 * @param {Object} client Instance of google.jobs module.
 * @param {string} companyName Name of company (value of 'name' field).
 */
function deleteCompany (client, companyName) {
  assert(companyName, 'companyName argument is required.');
  return new Promise((resolve, reject) => {
    client.companies.delete({
      name: companyName
    }, {}, null).then((response) => {
      assert(response.status === 200, 'Received response code: ' + response.status);
      assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
      resolve(response.data);
    });
  });
}
// [END delete_company]
exports.deleteCompany = deleteCompany;

/**
 * Main entry point function.
 */
function main () {
  getClient().then((jobsClient) => {
    assert(jobsClient, 'jobs instance not found.');

    let companyInfo = generateCompany();
    // Create a company.
    createCompany(jobsClient, companyInfo).then((info) => {
      const companyName = info.name;
      console.log('Company name:', companyName);

      // Get company.
      getCompany(jobsClient, companyName).then((info) => {
        // Set 'website' field.
        companyInfo.website = 'https://www.foobar.com';
        // Update company.
        updateCompany(jobsClient, companyName, companyInfo).then((info) => {
          assert(companyInfo.website === info.website, '\'website\' field did not get added.');
          console.log(info);

          // Delete company.
          deleteCompany(jobsClient, companyName);
        });
      });
    });
  }).catch((err) => {
    console.error(err);
    throw err;
  });
}

if (require.main === module) {
  main();
}
// [END basicCompanySample]
