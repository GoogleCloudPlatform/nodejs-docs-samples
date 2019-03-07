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

const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');

it('should do a commute search', async () => {
  const output = await tools.runAsync('node commute-search-sample.js');

  assert.strictEqual(
    new RegExp('.*matchingJobs.*commuteInfo.*').test(output),
    true
  );
  assert.strictEqual(
    new RegExp('.*matchingJobs.*1600 Amphitheatre Pkwy.*').test(output),
    true
  );
});
