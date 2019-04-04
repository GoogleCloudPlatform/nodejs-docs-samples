/**
 * Copyright 2018, Google, Inc.
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

// [START functions_http_integration_test]
const assert = require('assert');
const Supertest = require('supertest');
const supertest = Supertest(process.env.BASE_URL);

it('helloHttp: should print a name', async () => {
  await supertest
    .post('/helloHttp')
    .send({name: 'John'})
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello John!');
    });
});

it('helloHttp: should print hello world', async () => {
  await supertest
    .get('/helloHttp')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello World!');
    });
});
// [END functions_http_integration_test]
