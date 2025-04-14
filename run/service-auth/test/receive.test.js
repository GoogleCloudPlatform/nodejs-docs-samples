// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {expect} = require('chai');
const axios = require('axios');
const {execSync} = require('child_process');
const {v4: uuidv4} = require('uuid');

const INVALID_TOKEN = 'invalid-token';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const REGION = 'us-central1';

describe('receiveRequestAndParseAuthHeader sample (Cloud Run integration)', function () {
  this.timeout(5 * 60 * 1000); // 5 minutes for deploy + test
  const serviceName = `receive-${uuidv4().slice(0, 8)}`;
  let serviceUrl;

  before(() => {
    console.log(`Deploying Cloud Run service: ${serviceName}...`);
    execSync(
      `gcloud run deploy ${serviceName} \
      --project=${PROJECT_ID} \
      --region=${REGION} \
      --source=. \
      --allow-unauthenticated \
      --quiet`,
      {stdio: 'inherit'}
    );

    console.log('Fetching service URL...');
    serviceUrl = execSync(`gcloud run services describe ${serviceName} \
      --project=${PROJECT_ID} \
      --region=${REGION} \
      --format='value(status.url)'`)
      .toString()
      .trim();

    console.log(`Service URL: ${serviceUrl}`);
  });

  after(() => {
    console.log(`Deleting service: ${serviceName}...`);
    execSync(`gcloud run services delete ${serviceName} \
      --project=${PROJECT_ID} \
      --region=${REGION} \
      --quiet`);
  });

  function getIdentityToken() {
    return execSync('gcloud auth print-identity-token').toString().trim();
  }

  it('should respond with greeting if token is valid', async () => {
    const token = getIdentityToken();
    const res = await axios.get(serviceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).to.equal(200);
    expect(res.data).to.match(/^Hello, .@.\.\w+!\n$/);
  });

  it('should respond with anonymous if no token is provided', async () => {
    const res = await axios.get(serviceUrl);
    expect(res.status).to.equal(200);
    expect(res.data).to.equal('Hello, anonymous user.\n');
  });

  it('should respond with 401 if token is invalid', async () => {
    try {
      await axios.get(serviceUrl, {
        headers: {
          Authorization: `Bearer ${INVALID_TOKEN}`,
        },
      });
    } catch (err) {
      expect(err.response.status).to.equal(401);
      expect(err.response.data).to.include('Invalid token');
    }
  });
});
