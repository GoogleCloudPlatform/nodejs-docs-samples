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
const sinon = require('sinon');
const {OAuth2Client} = require('google-auth-library');
const {main} = require('../receive');

const TEST_VALID_TOKEN = 'test-valid-token';
const TEST_INVALID_TOKEN = 'test-invalid-token';

describe('receiveRequestAndParseAuthHeader sample', () => {
  let verifyStub, consoleStub;

  beforeEach(() => {
    verifyStub = sinon.stub(OAuth2Client.prototype, 'verifyIdToken');
    consoleStub = sinon.stub(console, 'log');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should log greeting if token is valid', async () => {
    const mockReq = {
      headers: {
        authorization: `Bearer ${TEST_VALID_TOKEN}`,
      },
    };

    verifyStub.resolves({
      getPayload: () => ({email: 'test@example.com'}),
    });

    await main(mockReq);
    expect(consoleStub.calledWith('Hello, test@example.com!\n')).to.be.true;
  });

  it('should log error message if token is invalid', async () => {
    const mockReq = {
      headers: {
        authorization: `Bearer ${TEST_INVALID_TOKEN}`,
      },
    };

    verifyStub.rejects(new Error('invalid'));

    await main(mockReq);
    expect(consoleStub.calledWithMatch(/Invalid token: invalid/)).to.be.true;
  });

  it('should log anonymous message if no auth header', async () => {
    const mockReq = {
      headers: {},
    };

    await main(mockReq);
    expect(consoleStub.calledWith('Hello, anonymous user.\n')).to.be.true;
  });
});
