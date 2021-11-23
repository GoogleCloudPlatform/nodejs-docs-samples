// Copyright 2019 Google LLC
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

const assert = require('assert');
const {auth} = require('google-auth-library');

describe('End-to-End Tests', () => {
  const {BASE_URL} = process.env;
  if (!BASE_URL) {
    throw Error(
      '"BASE_URL" environment variable is required. For example: https://service-x8xabcdefg-uc.a.run.app'
    );
  }

  it('post(/) without request parameters is a bad request', async () => {
    const account = 'kokoro-system-test@long-door-651.iam.gserviceaccount.com';
    const res = await auth.request({
      url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${account}:generateIdToken`,
      params: {
        audience: account,
      },
      method: 'POST',
    });
    const response = await auth.request({
      url: BASE_URL.trim() + '/',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${res.data.token}`,
      },
      validateStatus: () => true,
    });
    assert.strictEqual(
      response.status,
      400,
      'Bad Requests status not found'
    );
  });
});
