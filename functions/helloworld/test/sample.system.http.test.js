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

// [START functions_http_system_test]
const test = require(`ava`);
const Supertest = require(`supertest`);
const supertest = Supertest(process.env.BASE_URL);

test.cb(`helloHttp: should print a name`, (t) => {
  supertest
    .post(`/helloHttp`)
    .send({ name: 'John' })
    .expect(200)
    .expect((response) => {
      t.is(response.text, 'Hello John!');
    })
    .end(t.end);
});

test.cb(`helloHttp: should print hello world`, (t) => {
  supertest
    .get(`/helloHttp`)
    .expect(200)
    .expect((response) => {
      t.is(response.text, `Hello World!`);
    })
    .end(t.end);
});
// [END functions_http_system_test]
