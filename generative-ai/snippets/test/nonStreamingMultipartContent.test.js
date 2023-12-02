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
    // Split up conversation output
    const conversation  = output.split('\n');

    // Ensure that the conversation is what we expect for this scone image
    assert(conversation[0].match(/Prompt Text:/));
    assert(conversation[1].match(/Use several paragraphs to describe what is happening in this picture./));
    assert(conversation[2].match(/Non-Streaming Response Text:/));
    assert(conversation[3].match(/There are several blueberry scones on a table. They are arranged on a white surface that is covered in blue stains. There is a bowl of blueberries next to the scones. There is a cup of coffee on the table. There are pink flowers on the table. The scones are round and have a crumbly texture. They are topped with blueberries and sugar. The coffee is hot and steaming. The flowers are in bloom and have a sweet fragrance. The table is made of wood and has a rustic appearance. The overall effect of the image is one of beauty and tranquility./));
  });
});
