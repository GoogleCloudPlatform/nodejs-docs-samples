'use strict';

const {assert} = require('chai');
const {describe, it} = require('mocha');

const projectId = process.env.CAIP_PROJECT_ID;

const createSample = require('../content-cache/content-cache-create-with-txt-gcs-pdf.js');
const useSample = require('../content-cache/content-cache-use-with-txt.js');
const updateSample = require('../content-cache/content-cache-update.js');
const deleteSample = require('../content-cache/content-cache-delete.js');

describe('content-cache-create-use-update-delete', function () {
  this.timeout(60000);
  let contentCacheName;

  it('should create content cache', async () => {
    contentCacheName = await createSample.generateContent(projectId);
    assert.isString(contentCacheName);
    assert.isAbove(contentCacheName.length, 0);
  });

  it('should update content cache', async () => {
    await updateSample.generateContent(projectId, undefined, contentCacheName);
  });

  it('should use content cache', async () => {
    const response = await useSample.generateContent(
      projectId,
      undefined,
      contentCacheName
    );
    assert.isString(response);
  });

  it('should delete content cache', async () => {
    await deleteSample.generateContent(projectId, undefined, contentCacheName);
  });
});
