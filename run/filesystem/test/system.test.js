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
const {GoogleAuth} = require('google-auth-library');
const {execSync} = require('child_process');

const auth = new GoogleAuth();

const getEnvironmentVariable = (variable, defaultValue) => {
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
    return execSync(command, {timeout: 240000});
  } catch (err) {
    throw Error(err);
  }
};

auth.getClient();
const serviceName = getEnvironmentVariable('SERVICE_NAME', 'filesystem-app');
const projectId = getEnvironmentVariable('GOOGLE_CLOUD_PROJECT', 'werwerew');

describe('End-to-end test', () => {
  before(() => {
    const buildCmd = `gcloud builds submit --config=test/e2e_test_setup.yaml --project ${projectId} --substitutions=_FILESTORE_IP_ADDRESS=10.42.154.2,_RUN_SERVICE=${serviceName}`;
    console.log('Deploying required Google Cloud resources...');
    gcloudCmdExec(buildCmd);
  });
  after(() => {
    const cleanUpCmd = `gcloud builds submit --config=test/e2e_test_cleanup.yaml --project ${projectId} --substitutions=_RUN_SERVICE=${serviceName};`;
    console.log('Cleaning up Google Cloud Resources...');
    gcloudCmdExec(cleanUpCmd);
  });
  it('has Cloud Run end point', () => {
    assert(true).to.eql(true); // temp assert
  });
  it('GET endpoint responds with 200', () => {
    assert(true).to.eql(true); // temp assert
  });
});
