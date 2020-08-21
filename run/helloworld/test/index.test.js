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
const path = require('path');
const supertest = require('supertest');

let request;
describe('Unit Tests', () => {
  before(() => {
    const app = require(path.join(__dirname, '..', 'index'));
    request = supertest(app);
  });

  it('Service uses the NAME override', async () => {
    process.env.NAME = 'Cloud';
    const response = await request.get('/').expect(200);
    assert.equal(response.text, 'Hello Cloud!');
  });

  it('Service uses the NAME default', async () => {
    process.env.NAME = '';
    const response = await request.get('/').expect(200);
    assert.equal(response.text, 'Hello World!');
  });
});
