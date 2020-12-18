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

// [START functions_http_system_test]
const assert = require('assert');
const Supertest = require('supertest');
const supertest = Supertest(process.env.BASE_URL);
const childProcess = require('child_process');

describe('system tests', () => {
  // [END functions_http_system_test]
  before(() => {
    childProcess.execSync(
      `gcloud functions deploy helloHttp --allow-unauthenticated --runtime nodejs10 --trigger-http --ingress-settings=all --region=${process.env.GCF_REGION}; gcloud functions add-iam-policy-binding helloHttp --region=${process.env.GCF_REGION} --member="allUsers" --role=roles/cloudfunctions.invoker`
    );
  });

  after(() => {
    childProcess.execSync(
      `gcloud functions delete helloHttp --region=${process.env.GCF_REGION}`
    );
  });
  // [START functions_http_system_test]
  it('helloHttp: should print a name', async () => {
    await supertest
      .post('/helloHttp')
      .send({name: 'John'})
      .expect(200)
      .expect(response => {
        assert.strictEqual(response.text, 'Hello John!');
      });
  });
  // [END functions_http_system_test]

  it('helloHttp: should print hello world', async () => {
    await supertest
      .get('/helloHttp')
      .expect(200)
      .expect(response => {
        assert.strictEqual(response.text, 'Hello World!');
      });
  });
});
