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

const projectId = process.env.CAIP_PROJECT_ID;
const location = 'europe-west4';
const model = 'gemini-pro';

describe('Generative AI NonStreaming Chat', async () => {
  it('should create nonstreaming chat and begin the conversation the same in each instance', async () => {
    const output = execSync(
      `node ./nonStreamingChat.js ${projectId} ${location} ${model}`
    );

    // Ensure that the beginning of the conversation is consistent
    assert(output.match(/User: Hello/));
    assert(output.match(/User: Can you tell me a scientific fun fact?/));
    assert(output.match(/User: How can I learn more about that?/));
  });
});
