// Copyright 2019 Google LLC
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

const fs = require('fs');
const path = require('path');
const {Storage} = require('@google-cloud/storage');
const {assert} = require('chai');
const {before, after, it, describe} = require('mocha');
const cp = require('child_process');
const uuid = require('uuid');
const {promisify} = require('util');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const storage = new Storage();
const cwd = path.join(__dirname, '..');
const bucketName = generateName();
const bucket = storage.bucket(bucketName);
const fileName = 'test.txt';
const filePath = path.join(cwd, 'resources', fileName);
const downloadFilePath = path.join(cwd, 'downloaded.txt');

describe('file', () => {
  before(async () => {
    await bucket.create();
  });

  after(async () => {
    await promisify(fs.unlink)(downloadFilePath).catch(console.error);
    // Try deleting all files twice, just to make sure
    await bucket.deleteFiles({force: true}).catch(console.error);
    await bucket.deleteFiles({force: true}).catch(console.error);
    await bucket.delete().catch(console.error);
  });

  describe('Object Contexts', () => {
    const contextFile = bucket.file(fileName);

    beforeEach(async () => {
      await bucket.upload(filePath, {destination: fileName});

      await contextFile.setMetadata({
        contexts: {
          custom: {
            'team-owner': {value: 'storage-team'},
            priority: {value: 'high'},
          },
        },
      });
    });

    it('should set object contexts', async () => {
      const output = execSync(
        `node setObjectContexts.js ${bucketName} ${fileName}`
      );
      // Verify Initial Creation
      assert.include(output, `Updated Object Contexts for ${fileName}:`);
      assert.include(output, '"team-owner":');
      assert.include(output, '"value": "storage-team"');
      assert.include(output, '"priority":');
      assert.include(output, '"value": "high"');
      assert.include(output, '"createTime":');
      assert.include(output, '"updateTime":');

      const [metadata] = await contextFile.getMetadata();
      const customContexts = metadata.contexts?.custom || {};

      assert.strictEqual(customContexts['priority']?.value, 'high');
      assert.strictEqual(customContexts['team-owner']?.value, 'storage-team');
    });

    it('should get object contexts', async () => {
      const output = execSync(
        `node getObjectContexts.js ${bucketName} ${fileName}`
      );
      assert.include(output, `Object Contexts for ${fileName}:`);
      assert.include(output, 'Key: priority');
      assert.include(output, 'Value: high');
      assert.include(output, 'Key: team-owner');
      assert.include(output, 'Value: storage-team');

      const [metadata] = await contextFile.getMetadata();
      const customContexts = metadata.contexts?.custom || {};

      assert.strictEqual(customContexts['priority'].value, 'high');
      assert.strictEqual(customContexts['team-owner'].value, 'storage-team');
    });

    it('should list objects with context filters', async () => {
      const noContextFileName = `no-context-${fileName}`;
      await bucket.upload(filePath, {destination: noContextFileName});
      // Ensure it has no contexts
      await bucket
        .file(noContextFileName)
        .setMetadata({contexts: {custom: null}});

      const output = execSync(`node listObjectContexts.js ${bucketName}`);

      // Testing Existence of Value Pair (contexts."key"="val")
      assert.include(
        output,
        'Files matching filter [contexts."priority"="high"]'
      );
      assert.include(output, ` - ${fileName}`);

      // Testing Existence of Key (contexts."key":*)
      assert.include(output, 'Files with the "team-owner" context key');
      assert.include(output, ` - ${fileName}`);

      // Testing Absence of Value Pair (-contexts."key"="val")
      assert.include(
        output,
        'Files matching absence of value pair [-contexts."priority"="high"]'
      );
      assert.include(output, ` - ${noContextFileName}`);

      // Testing Absence of Key (-contexts."key":*)
      assert.include(
        output,
        'Files matching absence of key regardless of value [-contexts."team-owner":*]'
      );
      assert.include(output, ` - ${noContextFileName}`);

      const [files] = await bucket.getFiles();
      const targetFile = files.find(f => f.name === fileName);

      assert.exists(targetFile);
      const [metadata] = await targetFile.getMetadata();

      // Verify the state that the list filter is supposed to find
      assert.strictEqual(metadata.contexts?.custom?.priority?.value, 'high');

      await bucket.file(noContextFileName).delete();
    });
  });

  describe('compose file', () => {
    it('should combine multiple files into one new file and optionally delete source objects', async () => {
      const firstFileName = 'first.txt';
      const secondFileName = 'second.txt';
      const destinationFileName = 'destination.txt';

      // upload test.txt twice
      await bucket.upload(filePath, {destination: firstFileName});
      await bucket.upload(filePath, {destination: secondFileName});

      // Test with deleteSourceObjects = false
      let output = execSync(
        `node composeFile.js ${bucketName} ${firstFileName} ${secondFileName} ${destinationFileName} false`
      );
      assert.include(
        output,
        `New composite file ${destinationFileName} was created by combining ${firstFileName} and ${secondFileName}`
      );
      assert.notInclude(output, 'Deleted source objects');

      let [destExists] = await bucket.file(destinationFileName).exists();
      assert.strictEqual(destExists, true);
      let [firstExists] = await bucket.file(firstFileName).exists();
      assert.strictEqual(firstExists, true);
      let [secondExists] = await bucket.file(secondFileName).exists();
      assert.strictEqual(secondExists, true);

      await bucket.file(destinationFileName).delete();

      // Test with deleteSourceObjects = true
      output = execSync(
        `node composeFile.js ${bucketName} ${firstFileName} ${secondFileName} ${destinationFileName} true`
      );
      assert.include(
        output,
        `New composite file ${destinationFileName} was created by combining ${firstFileName} and ${secondFileName}`
      );
      assert.include(output, `Deleted source objects: ${firstFileName}, ${secondFileName}`);

      [destExists] = await bucket.file(destinationFileName).exists();
      assert.strictEqual(destExists, true);
      [firstExists] = await bucket.file(firstFileName).exists();
      assert.strictEqual(firstExists, false);
      [secondExists] = await bucket.file(secondFileName).exists();
      assert.strictEqual(secondExists, false);
    });
  });
});

function generateName() {
  return `nodejs-storage-samples-${uuid.v4()}`;
}
