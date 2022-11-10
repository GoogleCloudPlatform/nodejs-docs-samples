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

const {assert} = require('chai');
const execa = require('execa');
const retry = require('p-retry');

describe('quickstart', () => {
  it('should run the quickstart', async () => {
    // The write in the quickstart appears to be very, very flaky.
    // This should not be needed.  The tracking bug is here:
    // https://github.com/googleapis/nodejs-monitoring/issues/191
    await retry(
      async () => {
        const result = await execa.shell('node quickstart');
        assert.match(result.stdout, /Done writing time series data/);
      },
      {
        retries: 10,
        onFailedAttempt: () => console.warn('Write failed, retrying...'),
      }
    );
  });
});
