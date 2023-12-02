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

describe('Generative AI Stream Content', () => {
  const project = 'cloud-llm-preview1';
  const location = 'us-central1';
  const model = 'gemini-pro';

  it('should create stream content', async () => {
    const output = execSync(
      `node ./streamContent.js ${project} ${location} ${model}`
    );
    // Split up conversation output
    const conversation  = output.split('\n');
;
    // Ensure that the beginning of the conversation is consistent
    assert(conversation[0].match(/Prompt:/));
    assert(conversation[1].match(/What is Node.js?/));
    assert(conversation[2].match(/Streaming Response Text:/));
    assert(conversation[3].match(/Node.js is a JavaScript runtime built on Chrome's V8 JavaScript engine. It is designed to build scalable network applications. Node.js runs JavaScript code outside of a browser./));
    assert(conversation[5].match(/Here are some key features of Node.js:/));
  });
});
