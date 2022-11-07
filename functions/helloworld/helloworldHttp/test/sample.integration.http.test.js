// Copyright 2018 Google LLC
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

// [START functions_http_integration_test]
const supertest = require('supertest');

const {getTestServer} = require('@google-cloud/functions-framework/testing');
// [END functions_http_integration_test]

require('../');

describe('functions_helloworld_http HTTP integration test', () => {
  // [START functions_http_integration_test]
  it('helloHttp: should print a name with req body', async () => {
    const server = getTestServer('helloHttp');
    await supertest(server)
      .post('/')
      .send({name: 'John'})
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect('Hello John!');
  });
  // [END functions_http_integration_test]
  it('helloHttp: should print hello world', async () => {
    const server = getTestServer('helloHttp');
    await supertest(server).post('/').send().expect(200).expect('Hello World!');
  });
  it('helloHttp: should print a name with query', async () => {
    const server = getTestServer('helloHttp');
    await supertest(server)
      .post('/?name=John')
      .send()
      .expect(200)
      .expect('Hello John!');
  });
});
