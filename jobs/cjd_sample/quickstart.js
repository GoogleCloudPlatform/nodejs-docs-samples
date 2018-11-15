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

// [START quickstart]

// Imports the Google APIs client library
const {google} = require('googleapis');

google.auth
  .getClient({scopes: ['https://www.googleapis.com/auth/jobs']})
  .then(auth => {
    // Instantiates an authorized client
    const jobs = google.jobs({
      version: 'v2',
      auth,
    });

    // Lists companies
    jobs.companies.list((err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Request ID: ${result.data.metadata.requestId}`);

      const companies = result.data.companies || [];

      if (companies.length) {
        console.log('Companies:');
        companies.forEach(company => console.log(company.name));
      } else {
        console.log(`No companies found.`);
      }
    });
  });
// [END quickstart]
