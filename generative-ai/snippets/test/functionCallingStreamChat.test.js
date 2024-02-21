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

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

describe('Generative AI Function Calling Stream Chat', () => {
  const project = 'cloud-llm-preview1';
  const location = 'us-central1';
  const model = 'gemini-1.0-pro';

  it('should create stream chat and begin the conversation the same in each instance', async () => {
    const output = execSync(
      `node ./functionCallingStreamChat.js ${project} ${location} ${model}`
    );

    // Assert that the response is what we expect
    assert(output.match(/The weather in Boston is super nice./));
  });
});
