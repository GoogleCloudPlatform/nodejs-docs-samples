// Copyright 2020 Google LLC
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

const assert = require('assert');
const requestServiceToken = require('../auth.js');

let res;

describe('requestServiceToken tests', () => {
  before(async function () {
    this.timeout(3000);
    res = await requestServiceToken('');
  });

  it('should return an error if given invalid Receiving Service URL', () => {
    assert.strictEqual(typeof res, 'object'); 
    assert.strictEqual(res.code, 'EHOSTDOWN');
  });
});
