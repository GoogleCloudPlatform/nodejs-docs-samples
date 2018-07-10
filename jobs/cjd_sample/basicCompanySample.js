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

const assert = require('assert');
const {google} = require('googleapis');

/**
 * Get authorized client.
 * @returns {Promise.Object} Promise containing instance of google.jobs module.
 */
function getClient() {
    return new Promise((resolve, reject) => {
        google.auth.getApplicationDefault((err, authClient) => {
            if (err) {
              reject(err);
              return;
            }
          
            if (authClient.createScopedRequired && authClient.createScopedRequired()) {
              authClient = authClient.createScoped([
                "https://www.googleapis.com/auth/jobs"
              ]);
            }
          
            // Instantiates an authorized client
            const jobs = google.jobs({
              version: 'v2',
              auth: authClient
            });
            resolve(jobs);
        });
    });
}
exports.getClient = getClient;

/**
 * Generate data for a company.
 * @returns {Object} Object containing fields of 'Company' resource.
 */
function generateCompany() {
    return {
        displayName: 'Google',
        distributorCompanyId: 'company:' + Math.floor(Math.random() * 100000).toString(),
        hqLocation: '1600 Amphitheatre Parkway Mountain View, CA 94043'
    };
}

/**
 * Create a new company.
 * @param {Object} jobs Instance of google.jobs module.
 * @param {Object} companyInfo Object containing fields of 'Company' resource.
 * @returns {Promise.Object} Promise containing name of company that got created.
 */
function createCompany(jobs, companyInfo) {
    assert(companyInfo, '\'companyInfo\' argument is required.');
    // Check required fields.
    assert(companyInfo.displayName, '\'displayName\' field is required.');
    assert(companyInfo.distributorCompanyId, '\'distributorCompanyId\' field is required.');

    return new Promise((resolve, reject) => {
        jobs.companies.create({ resource: companyInfo }, {}, null).then((response) => {
            assert(response.status === 200, 'Received response code: ' + response.status);
            assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
            assert(response.data, '\'data\' field not populated in response.');
            resolve(response.data);
        });
    });    
}
exports.createCompany = createCompany;

/**
 * Get a company.
 * @param {Object} jobs Instance of google.jobs module.
 * @param {string} companyName Name of company (value of 'name' field).
 */
function getCompany(jobs, companyName) {
    assert(companyName, 'companyName argument is required.');
    return new Promise((resolve, reject) => {
        jobs.companies.get({ name: companyName }, {}, null).then((response) => {
            assert(response.status === 200, 'Received response code: ' + response.status);
            assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
            resolve(response.data);
        });
    });
}
exports.getCompany = getCompany;

/**
 * Update a company.
 * @param {Object} jobs Instance of google.jobs module.
 * @param {string} companyName Name of company (value of 'name' field).
 * @param {*} companyInfo Object containing fields of 'Company' resource.
 */
function updateCompany(jobs, companyName, companyInfo) {
    assert(companyName, '\'companyName\' argument is required.');
    assert(companyInfo, '\'companyName\' argument is required.');

    return new Promise((resolve, reject) => {
        jobs.companies.patch({ name: companyName, resource: companyInfo }, {}, null).then((response) => {
            assert(response.status === 200, 'Received response code: ' + response.status);
            assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
            resolve(response.data); 
        });
    });
}
exports.updateCompany = updateCompany;

/**
 * Delete a company.
 * @param {Object} jobs Instance of google.jobs module.
 * @param {string} companyName Name of company (value of 'name' field).
 */
function deleteCompany(jobs, companyName) {
    assert(companyName, 'companyName argument is required.');
    return new Promise((resolve, reject) => {
        jobs.companies.delete({ name: companyName }, {}, null).then((response) => {
            assert(response.status === 200, 'Received response code: ' + response.status);
            assert(response.statusText === 'OK', 'Received status: ' + response.statusText);
            resolve(response.data);
        });
    });
}
exports.deleteCompany = deleteCompany;

/**
 * Main entry point function.
 */
function main() {
    getClient().then((jobs) => {
        assert(jobs, 'jobs instance not found.');
        
        let companyInfo = generateCompany();
        // Create a company.
        createCompany(jobs, companyInfo).then((info) => {
            const companyName = info.name;
            console.log('Company name:', companyName);
            
            // Get company.
            getCompany(jobs, companyName).then((info) => {
                // Set 'website' field.
                companyInfo.website = 'https://www.foobar.com';
                // Update company.
                updateCompany(jobs, companyName, companyInfo).then((info) => {
                    assert(companyInfo.website === info.website, '\'website\' field did not get added.');
                    console.log(info);

                    // Delete company.
                    deleteCompany(jobs, companyName);
                });
            });
        });
    })
    .catch((err) => {
        console.error(err);
        throw err;
    });
}

if (require.main === module) {
    main();
}