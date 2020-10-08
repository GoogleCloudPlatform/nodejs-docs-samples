// Copyright 2020 Google LLC
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
const supertest = require('supertest');
process.env.TABLE = "votes_dev";
const {createTable, dropTable} = require('../cloud-sql');

let request;

describe('Unit Tests', () => {
  before(async () => {
    try {
      console.log("Creating table...");
      await createTable();
    } catch(err) {
      console.log(`Error creating DB table: ${err}`)
    }
    const app = require(path.join(__dirname, '..', 'app'));
    request = supertest(app);
  });

  after(async () => {
    try {
      console.log("Dropping table...");
      await dropTable();
    } catch(err) {
      console.log(`Error dropping DB table: ${err}`)
    }
  })

  it('should display the default page', async () => {
    await request
      .get('/')
      .expect(200)
      .expect((response) => {
        assert.ok(response.text.includes('CATS v DOGS'));
      });
  });

  it('should reject request without JWT token', async () => {
    await request
      .post('/')
      .expect(401);
  });

  it('should reject request with invalid JWT token', async () => {
    await request
      .post('/')
      .set('Authorization', 'Bearer iam-a-token')
      .expect(403);
  });

});
