// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * Checks if an error is due to a lack of permissions (PERMISSION_DENIED / code 7)
 * and skips the test if so. Otherwise, rethrows the error.
 * @param {Error} err - The captured error.
 * @param {Object} testContext - The Mocha test context (`this` inside the test) to allow skipping.
 */
function handlePermissionError(err, testContext) {
  const isPermissionError =
    err.code === 7 ||
    (err.message && err.message.includes('PERMISSION_DENIED')) ||
    (err.details && err.details.includes('PERMISSION_DENIED'));

  if (isPermissionError) {
    console.warn(
      `[CI Skip] Skipping test due to missing permissions: ${err.message}`
    );
    if (testContext && typeof testContext.skip === 'function') {
      testContext.skip();
      return;
    }
  }
  throw err;
}

module.exports = {
  handlePermissionError,
};
