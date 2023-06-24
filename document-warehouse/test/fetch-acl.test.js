/** Copyright 2023 Google LLC
 *
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

const cp = require('child_process');
const path = require('path');
const assert = require('assert');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');
const PROJECT_ID_PASS = 'YOUR_PROJECT_ID';
const PROJECT_ID_FAILED = 'PROJECT_ID_WITHOUT_ACL';
const LOCATION = 'us';
const USER_ID = 'user:xxxx@example.com';
const DOCUMENT_ID = 'YOUR_DOCUMENT_ID';

describe('Fetch document acl', () => {
  it('should get acl given only a projectId', async () => {
    const stdout = execSync(`node ./fetch-acl.js ${PROJECT_ID_PASS} `, {cwd});
    assert(stdout.startsWith('Success!'));
  });

  it('should get acl given a documentId', async () => {
    const stdout = execSync(
      `node ./fetch-acl.js ${PROJECT_ID_PASS} ${LOCATION} ${USER_ID} ${DOCUMENT_ID}`,
      {cwd}
    );
    assert(stdout.startsWith('Success!'));
  });

  it('should fail given an incorrect projectId', async () => {
    const stdout = execSync(`node ./fetch-acl.js ${PROJECT_ID_FAILED}`, {cwd});
    assert(stdout.startsWith('Failed!'));
  });
});
