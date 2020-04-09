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

const request = require('supertest');
const sinon = require('sinon');
const assert = require('assert');

// Stub out MySQL calls
const stubMysql = sinon.stub(require('promise-mysql'));
const poolStub = sinon.stub();
const queryStub = sinon.stub();
queryStub.withArgs(sinon.match(
    `CREATE TABLE IF NOT EXISTS votes
      ( vote_id SERIAL NOT NULL, time_cast timestamp NOT NULL,
      candidate CHAR(6) NOT NULL, PRIMARY KEY (vote_id) );`
)).resolves([]);
queryStub.withArgs(sinon.match('SELECT COUNT(vote_id)')).resolves([{count: 1}]);
queryStub.withArgs(sinon.match('SELECT candidate, time_cast')).resolves([]);
poolStub['query'] = queryStub;
stubMysql.createPool.returns(poolStub);

const server = require('../server.js');

it('check index page', async () => {
  const response = await request(server).get('/').timeout(1000);

  assert.strictEqual(response.status, 200);
});

server.close();
