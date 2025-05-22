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

const axios = require('axios');
const {execSync} = require('child_process');
const {expect} = require('chai');
const {GoogleAuth} = require('google-auth-library');
const {StatusCodes} = require('http-status-codes');
const {v4: uuidv4} = require('uuid');

const TEST_INVALID_TOKEN = 'test-invalid-token';
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const REGION = 'us-central1';

if (!PROJECT_ID) {
  throw new Error('GOOGLE_CLOUD_PROJECT environment variable not set.');
}

describe('receiveRequestAndParseAuthHeader sample (Cloud Run integration)', function () {
  this.timeout(5 * 60 * 1000); // 5 minutes for deploy + test
  // const serviceName = `service-auth-node-${uuidv4().slice(0, 8)}`;
  const serviceName = 'service-auth-node';
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

  /*
  after(() => {
    console.log(`Deleting service: ${serviceName}...`);
    execSync(`gcloud run services delete ${serviceName} \
      --project=${PROJECT_ID} \
      --region=${REGION} \
      --quiet`);
  });
  */

  async function getIdentityToken() {
    // Cloud Run uses your service's hostname as the `audience` value
    // For example: 'https://my-cloud-run-service.run.app'
    const targetAudience = serviceUrl;

    // Get an ID token client.
    // https://cloud.google.com/nodejs/docs/reference/google-auth-library/latest#fetching-id-tokens
    const authClient = new GoogleAuth();
    const client = await authClient.getIdTokenClient(targetAudience);
    const token = await client.idTokenProvider.fetchIdToken(targetAudience);

    // DEBUG: Remove these lines
    console.log(`ID Token: ${token}\n`);
    console.log(`Audience: ${targetAudience}\n`);

    return token;
  }

  it('should respond an HTTP OK (200) if token is valid', async () => {
    const token = await getIdentityToken();
    const res = await axios.get(serviceUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    expect(res.status).to.equal(StatusCodes.OK);
    expect(res.data).to.include('Hello');
  });

  it('should respond an HTTP UNAUTHORIZED (401) if no token is provided', async () => {
    try {
      await axios.get(serviceUrl);
    } catch (err) {
      expect(err.response.status).to.equal(StatusCodes.UNAUTHORIZED);
      expect(err.response.data).to.include('Unauthorized request.');
    }
  });

  it('should respond an HTTP UNAUTHORIZED (401) if token is invalid', async () => {
    try {
      await axios.get(serviceUrl, {
        headers: {
          Authorization: `Bearer ${TEST_INVALID_TOKEN}`,
        },
      });
    } catch (err) {
      expect(err.response.status).to.equal(StatusCodes.UNAUTHORIZED);
      expect(err.response.data).to.include('Unauthorized request.');
    }
  });
});
