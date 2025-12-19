// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');

const projectId = process.env.CAIP_PROJECT_ID;

const createSample = require('../content-cache-create-with-txt-gcs-pdf.js');
const useSample = require('../content-cache-use-with-txt.js');
const updateSample = require('../content-cache-update.js');
const deleteSample = require('../content-cache-delete.js');
const {delay} = require('../../test/util');

describe('content-cache-create-use-update-delete', async function () {
  this.timeout(600000);
  this.retries(5);
  await delay(this.test);

  let contentCacheName;

  it('should create content cache', async () => {
    contentCacheName = await createSample.generateContentCache(projectId);
    assert.isString(contentCacheName);
    assert.isAbove(contentCacheName.length, 0);
  });

  it('should update content cache', async () => {
    await updateSample.updateContentCache(
      projectId,
      undefined,
      contentCacheName
    );
  });

  it('should use content cache', async () => {
    const response = await useSample.useContentCache(
      projectId,
      undefined,
      contentCacheName
    );
    assert.isString(response);
  });

  it('should delete content cache', async () => {
    await deleteSample.deleteContentCache(
      projectId,
      undefined,
      contentCacheName
    );
  });
});
