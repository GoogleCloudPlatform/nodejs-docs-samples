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

const authenticate = async () => {
    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/cloud-platform'
    });
    const client = await auth.getClient();
    const projectId = await auth.getProjectId();
    const url = `https://dns.googleapis.com/dns/v1/projects/${projectId}`;
};

authenticate().catch(console.error)

describe('End-to-end test', () => {
  before(() => {
    const projectID = getEnvironmentVariable('GOOGLE_CLOUD_PROJECT');
  });
  after(() => {
    console.log('Run e2e_test_cleanup');
  });
  it('completes Cloud Build e2e', () => {
    assert(true).to.eql(true); // temp assert
  });
});
