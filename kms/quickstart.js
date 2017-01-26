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

// [START kms_quickstart]
// Imports the Google APIs client library
const google = require('googleapis');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Lists keys in the "global" location.
const location = 'global';

// Acquires credentials
google.auth.getApplicationDefault((err, authClient) => {
  if (err) {
    console.error('Failed to acquire credentials');
    return;
  }

  if (authClient.createScopedRequired && authClient.createScopedRequired()) {
    authClient = authClient.createScoped([
      'https://www.googleapis.com/auth/cloud-platform'
    ]);
  }

  // Instantiates an authorized client
  const cloudkms = google.cloudkms({
    version: 'v1beta1',
    auth: authClient
  });
  const request = {
    parent: `projects/${projectId}/locations/${location}`
  };

  // Lists key rings
  cloudkms.projects.locations.keyRings.list(request, (err, result) => {
    if (err) {
      console.error(err);
      return;
    }

    const keyRings = result.keyRings || [];

    if (keyRings.length) {
      console.log('Key rings:');
      result.keyRings.forEach((keyRing) => console.log(keyRing.name));
    } else {
      console.log(`No key rings found.`);
    }
  });
});
// [END kms_quickstart]
