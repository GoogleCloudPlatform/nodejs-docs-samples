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

describe('Generative AI NonStreaming Multipart Content', () => {
  const project = 'cloud-llm-preview1';
  const location = 'us-central1';
  const model = 'gemini-pro-vision';
  const image = 'gs://generativeai-downloads/images/scones.jpg';

  it('should create nonstreaming multipart content and begin the conversation the same in each instance', async () => {
    const output = execSync(
      `node ./nonStreamingMultipartContent.js ${project} ${location} ${model} ${image}`
    );

    // Ensure that the conversation is what we expect for this scone image
    assert(output.match(/Prompt Text:/));
    assert(output.match(/what is shown in this image/));
    assert(output.match(/Non-Streaming Response Text:/));
    assert(output.match(/scone/));
  });
});
