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

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;

// Acquires credentials
google.auth.getApplicationDefault((err, authClient) => {
  if (err) {
    console.error('Failed to acquire credentials');
    console.error(err);
    return;
  }

  if (authClient.createScopedRequired && authClient.createScopedRequired()) {
    authClient = authClient.createScoped([
      'https://www.googleapis.com/auth/jobs',
    ]);
  }

  // Instantiates an authorized client
  const jobServiceClient = google.jobs({
    version: 'v3',
    auth: authClient,
  });

  const request = {
    parent: `projects/${PROJECT_ID}`,
  };

  // Lists companies
  jobServiceClient.projects.companies.list(request, (err, result) => {
    if (err) {
      console.error(`Failed to retrieve companies! ${err}`);
      throw err;
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
