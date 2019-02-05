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
const runSample = `require('./basic-company-sample').runSample()`;

it('Should create a company, get a company, update a company, update a company with field mask and delete a company', async () => {
  const output = await tools.runAsync(`node -e ${runSample}`);
  const pattern =
    '.*Company generated:.*\n' +
    '.*Company created:.*\n' +
    '.*Company existed:.*\n' +
    '.*Company updated:.*elgoog.*\n' +
    '.*Company updated:.*changedTitle.*\n' +
    '.*Company deleted.*';

  assert.strictEqual(new RegExp(pattern).test(output), true);
});
