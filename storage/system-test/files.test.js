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

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT,
});
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

    it('should set object contexts', () => {
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

      // Verify Specific Key Deletion
      assert.include(
        output,
        `Deleted 'team-owner' key from contexts for ${fileName}.`
      );

      // Verify Clearing All Contexts
      assert.include(output, `Cleared all custom contexts for ${fileName}.`);
    });

    it('should get object contexts', () => {
      const output = execSync(
        `node getObjectContexts.js ${bucketName} ${fileName}`
      );
      assert.include(output, `Object Contexts for ${fileName}:`);
      assert.include(output, 'Key: priority');
      assert.include(output, 'Value: high');
      assert.include(output, 'Key: team-owner');
      assert.include(output, 'Value: storage-team');
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

      await bucket.file(noContextFileName).delete();
    });
  });
});

function generateName() {
  return `nodejs-storage-samples-${uuid.v4()}`;
}
