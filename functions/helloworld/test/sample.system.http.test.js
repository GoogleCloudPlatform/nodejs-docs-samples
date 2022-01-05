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
const {request} = require('gaxios');
const childProcess = require('child_process');

if (!process.env.BASE_URL) {
  throw new Error('"BASE_URL" env var must be set.');
}

if (!process.env.GCF_REGION) {
  throw new Error('"GCF_REGION" env var must be set.');
}

const FUNCTION_URL = `${process.env.BASE_URL}/helloHttp`;

describe('system tests', () => {
  // [END functions_http_system_test]
  before(() => {
    childProcess.execSync(
      `gcloud functions deploy helloHttp --allow-unauthenticated --runtime nodejs16 --trigger-http --ingress-settings=all --region=${process.env.GCF_REGION}`
    );
  });

  after(() => {
    childProcess.execSync(
      `gcloud functions delete helloHttp --region=${process.env.GCF_REGION} --quiet`
    );
  });
  // [START functions_http_system_test]
  it('helloHttp: should print a name', async () => {
    const response = await request({
      url: FUNCTION_URL,
      method: 'POST',
      data: {name: 'John'},
    });
    assert.strictEqual(response.data, 'Hello John!');
  });
  // [END functions_http_system_test]

  it('helloHttp: should print hello world', async () => {
    const response = await request({
      url: FUNCTION_URL,
      method: 'POST',
    });
    assert.strictEqual(response.data, 'Hello World!');
  });
});
