/**
 * Copyright 2018, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const util = require(`util`);
const uuid = require(`uuid`);
const cwd = path.join(__dirname, `..`);
const cmd = `node quickstart.js`;

const {Storage} = require(`@google-cloud/storage`, {});

const storage = new Storage();
const bucketName = `asset-nodejs-${uuid.v4()}`;
const bucket = storage.bucket(bucketName);

test.before(tools.checkCredentials);
test.before(async () => {
  await bucket.create();
});

test.after.always(async () => {
  try {
    await bucket.delete();
  } catch (err) {} // ignore error
});

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`should export assets to specified path`, async t => {
  var dumpFilePath = util.format('gs://%s/my-assets.txt', bucketName);
  await tools.runAsyncWithIO(
    `${cmd} export-assets ${dumpFilePath}`,
    cwd
  );
  const [exists] = await bucket.file();
  t.true(exists);
});
