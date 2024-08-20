// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const {execSync} = require('child_process');
const exec = cmd => execSync(cmd, {encoding: 'utf8'});

// TODO(developers): update for your own environment
const organizationId = '1081635000895';

describe('listAllAssets', () => {
  it('should print all assets in org', () => {
    const output = exec(`node v1/listAllAssets.js ${organizationId}`);
    assert.isAtLeast(output.match(/\n/g).length + 1, 62);
    assert.notMatch(output, /undefined/);
  });
});
