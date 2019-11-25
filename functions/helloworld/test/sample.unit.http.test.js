// Copyright 2018 Google LLC
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

describe('functions_helloworld_http', () => {
  // [START functions_http_unit_test]
  const assert = require('assert');
  const sinon = require('sinon');
  const uuid = require('uuid');

  const {helloHttp} = require('..');

  it('helloHttp: should print a name', () => {
    // Mock ExpressJS 'req' and 'res' parameters
    const name = uuid.v4();
    const req = {
      query: {},
      body: {
        name: name,
      },
    };
    const res = {send: sinon.stub()};

    // Call tested function
    helloHttp(req, res);

    // Verify behavior of tested function
    assert.ok(res.send.calledOnce);
    assert.deepStrictEqual(res.send.firstCall.args, [`Hello ${name}!`]);
  });
  // [END functions_http_unit_test]

  it('helloHttp: should print hello world', () => {
    // Mock ExpressJS 'req' and 'res' parameters
    const req = {
      query: {},
      body: {},
    };
    const res = {send: sinon.stub()};

    // Call tested function
    helloHttp(req, res);

    // Verify behavior of tested function
    assert.ok(res.send.calledOnce);
    assert.deepStrictEqual(res.send.firstCall.args, ['Hello World!']);
  });
});
