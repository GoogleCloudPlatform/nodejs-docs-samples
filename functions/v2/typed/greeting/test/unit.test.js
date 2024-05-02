// Copyright 2023 Google LLC
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

const {getFunction} = require('@google-cloud/functions-framework/testing');
const assert = require('assert');
require('..');

describe('functions_typed_greeting', () => {
  it('should respond to greetings correctly', async () => {
    const expected = {
      message: 'Hello Jane Doe!',
    };

    const chatFn = getFunction('greeting').handler;

    const actual = chatFn({
      first_name: 'Jane',
      last_name: 'Doe',
    });

    assert.deepEqual(actual, expected);
  });
});
