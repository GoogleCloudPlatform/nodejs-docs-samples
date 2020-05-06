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

let request, service, markdown;

describe('Editor renderRequest unit tests', function () {
  this.timeout(6000);
  
  before(async () => {
    request = require(path.join(__dirname, '..', 'render'));
    service = {url: 'https://www.google.com'};
    markdown = "**markdown text**";
  });

  it('can make an unauthenticated request', async () => {
    service.isAuthenticated = false;
    assert.rejects(request(service, markdown));
  })

  it('can make an authenticated request with an invalid url', async () => {
    service.isAuthenticated = true;
    assert.rejects(request(service, markdown));
  })
});