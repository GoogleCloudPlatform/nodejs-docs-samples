// Copyright 2022 Google LLC
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

'use strict';

const assert = require('assert');
const delay = require('delay');
const sinon = require('sinon');

const sample = require('../');

describe('functions_tips_gcp_apis', () => {
  it('should call a GCP API', async () => {
    const {FUNCTIONS_TOPIC} = process.env;
    if (!FUNCTIONS_TOPIC) {
      throw new Error('FUNCTIONS_TOPIC env var must be set.');
    }
    const reqMock = {
      body: {
        topic: FUNCTIONS_TOPIC,
      },
    };
    const resMock = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };

    sample.gcpApiCall(reqMock, resMock);

    // Instead of modifying the sample to return a promise,
    // use a delay here and keep the sample idiomatic
    await delay(2000);

    assert.ok(resMock.status.calledOnce);
    assert.ok(resMock.status.calledWith(200));
  });
});
