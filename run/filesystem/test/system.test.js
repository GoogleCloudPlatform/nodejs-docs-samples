// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const assert = require('chai').expect;
const chai = require('chai');
const {GoogleAuth} = require('google-auth-library');
const {execSync} = require('child_process');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const auth = new GoogleAuth();

const getEnvironmentVariable = (variable, defaultValue) => {
  // Return value of environment variable. Returns fallback default value if not set.
  if (variable in process.env) {
    return process.env[variable];
  }
  if (defaultValue) {
    return defaultValue;
  }
  throw Error(
    `Environment variable ${variable} not set and no default value provided.`
  );
};

const gcloudCmdExec = command => {
  // Returns standard output of gcloud command
  try {
    return execSync(command, {timeout: 240000}).toString();
  } catch (err) {
    throw Error(err);
  }
};

auth.getClient();
const appendRandomSuffix = string =>
  `${string}-${Math.random().toString().substring(2, 8)}`;
const serviceName = getEnvironmentVariable(
  'SERVICE_NAME',
  appendRandomSuffix('filesystem-app')
);
const projectId = getEnvironmentVariable('GOOGLE_CLOUD_PROJECT');
const region = 'us-central1';

describe('End-to-end test', () => {
  before(() => {
    const buildCmd = `gcloud builds submit --config=test/e2e_test_setup.yaml --project ${projectId} --substitutions=_FILESTORE_IP_ADDRESS=10.42.154.2,_RUN_SERVICE=${serviceName},_REGION=${region}`;
    console.log('Deploying required Google Cloud resources...');
    gcloudCmdExec(buildCmd);
  });
  after(() => {
    const cleanUpCmd = `gcloud builds submit --config=test/e2e_test_cleanup.yaml --project ${projectId} --substitutions=_RUN_SERVICE=${serviceName},_REGION=${region};`;
    console.log('Cleaning up Google Cloud Resources...');
    gcloudCmdExec(cleanUpCmd);
  });
  it('GET endpoint URL responds with 200', done => {
    const runCmd = `gcloud run services describe ${serviceName} --project=${projectId} --region=${region} --format='value(status.url)'`;
    const runEndPointUrl = gcloudCmdExec(runCmd).trim();
    chai
      .request(runEndPointUrl)
      .get('/')
      .end((err, res) => {
        assert(res.status).to.eql(200);
        done();
      });
  });
});
