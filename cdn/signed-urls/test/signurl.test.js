// Copyright 2025 Google LLC
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

const {signUrl} = require('../signurl');
const assert = require('node:assert/strict');

describe('signUrl', () => {
  it('should return signed url with corresponding parameters', () => {
    const url = new URL('https://cdn.example.com/test-path');
    const keyName = 'test-key-name';
    const keyValue = '0zY26LFZ2yAa3fERaKiKDQ==';
    const expirationDate = new Date();

    const resultUrl = new URL(
      signUrl(url.href, keyName, keyValue, expirationDate)
    );
    assert.strictEqual(resultUrl.hostname, url.hostname);
    assert.strictEqual(resultUrl.pathname, url.pathname);
    assert.strictEqual(resultUrl.searchParams.get('KeyName'), keyName);
    assert.strictEqual(
      resultUrl.searchParams.get('Expires'),
      Math.floor(expirationDate.valueOf() / 1000).toString()
    );
    assert.ok(resultUrl.searchParams.get('Signature'));
  });
});
