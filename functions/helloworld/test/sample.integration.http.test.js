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
const delay = require('delay');
const execPromise = require('child-process-promise').exec;
const path = require('path');
const supertest = require('supertest');
const uuid = require('uuid');

const request = supertest(process.env.BASE_URL || 'http://localhost:8080');
const cwd = path.join(__dirname, '..');

let ffProc;

before(async () => {
  ffProc = execPromise(
    `functions-framework --target=helloHttp --signature-type=http`,
    {timeout: 1000, shell: true, cwd: cwd}
  );

  await delay(600);
});

after(async () => {
  await ffProc;
});

it('helloHttp: should print a name', async () => {
  const name = uuid.v4();

  await request
    .post('/helloHttp')
    .send({name: name})
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, `Hello ${name}!`);
    });
}).timeout(1000);

it('helloHttp: should print hello world', async () => {
  await request
    .get('/helloHttp')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello World!');
    });
}).timeout(1000);
// [END functions_http_integration_test]
