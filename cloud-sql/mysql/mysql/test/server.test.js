// Copyright 2019 Google LLC
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

const path = require('path');
const request = require('supertest');
const assert = require('assert');

const SAMPLE_PATH = path.join(__dirname, '../server.js');

const server = require(SAMPLE_PATH);

after(() => {
  server.close();
});

it('should display the default page', async () => {
  await request(server)
    .get('/')
    .expect(200)
    .expect(response => {
      assert.ok(response.text.includes('Tabs VS Spaces'));
    });
});

it('should handle insert error', async () => {
  const expectedResult = 'Invalid team specified';

  await request(server)
    .post('/')
    .expect(400)
    .expect(response => {
      assert.ok(response.text.includes(expectedResult));
    });
});
