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

require(`../../system-test/_setup`);

const proxyquire = require(`proxyquire`).noPreserveCache();
const google = proxyquire(`googleapis`, {});

function list (callback) {
  google.auth.getApplicationDefault((err, authClient) => {
    if (err) {
      callback(err);
      return;
    }

    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform'
      ]);
    }

    const cloudkms = google.cloudkms({
      version: 'v1beta1',
      auth: authClient
    });
    const params = {
      parent: `projects/${process.env.GCLOUD_PROJECT}/locations/global`
    };

    cloudkms.projects.locations.keyRings.list(params, callback);
  });
}

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.cb(`should list key rings`, (t) => {
  const googleapisMock = {
    cloudkms () {
      return {
        projects: {
          locations: {
            keyRings: {
              list (params, callback) {
                list((err, result) => {
                  if (err) {
                    t.end(err);
                    return;
                  }
                  callback(err, result);

                  setTimeout(() => {
                    try {
                      t.true(console.log.called);
                      if (result && result.keyRings && result.keyRings.length) {
                        t.deepEqual(console.log.getCall(0).args, [`Key rings:`]);
                      } else {
                        t.deepEqual(console.log.getCall(0).args, [`No key rings found.`]);
                      }
                      t.end();
                    } catch (err) {
                      t.end(err);
                    }
                  }, 200);
                });
              }
            }
          }
        }
      };
    }
  };

  proxyquire(`../quickstart`, {
    'googleapis': googleapisMock
  });
});
