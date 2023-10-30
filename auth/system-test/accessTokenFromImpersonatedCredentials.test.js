// Copyright 2023 Google LLC
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

const assert = require('assert');
const path = require('path');
const {execSync} = require('child_process');

const cwd = path.join(__dirname, '..');
const cmd = 'node accessTokenFromImpersonatedCredentials.js';

const impersonatedServiceAccount =
  'auth-samples-testing@long-door-651.iam.gserviceaccount.com';
const scope = 'https://www.googleapis.com/auth/cloud-platform';

it('should get an access token from an impersonated service account', () => {
  const output = execSync(`${cmd} ${impersonatedServiceAccount} ${scope}`, {
    cwd,
    shell: true,
  });
  assert.strictEqual(output.includes('Generated OAuth2 token'), true);
});
