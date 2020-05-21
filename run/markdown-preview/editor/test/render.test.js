// Copyright 2020 Google LLC
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

const assert = require('assert');
const path = require('path');

let renderRequest, markdown;

describe('Editor renderRequest unit tests', function () {
  this.timeout(9000);
  
  before(async () => {
    renderRequest = require(path.join(__dirname, '..', 'render'));
    process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
    markdown = "**markdown text**";
  });

  it('can make a request with an valid url', async () => {
    // Request will be successful and return the converted markdown as a string.
      const response = await renderRequest(markdown);
      let exampleString = response.includes('This domain is for use in illustrative examples in documents.');
      assert.equal(exampleString, true);
  });
});