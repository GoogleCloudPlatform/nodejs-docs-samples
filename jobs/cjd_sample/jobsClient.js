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

const { google } = require('googleapis');

/**
 * Get authorized client od google.jobs module.
 * @returns {Promise.Object} Promise containing instance of google.jobs module.
 */
function getClient () {
  return new Promise((resolve, reject) => {
    google.auth.getApplicationDefault((err, authClient) => {
      if (err) {
        reject(err);
        return;
      }

      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        authClient = authClient.createScoped([
          'https://www.googleapis.com/auth/jobs'
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
