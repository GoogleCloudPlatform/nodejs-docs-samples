/**
 * Copyright 2017, Google, Inc.
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

const fs = require(`fs`);
const path = require(`path`);
const {Storage} = require(`@google-cloud/storage`);
const storage = new Storage();
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cmd = `node analyze.v1beta2.js`;
const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const fileName = `text.txt`;
const fileName2 = `android_text.txt`;
const localFilePath = path.join(__dirname, `../resources/${fileName}`);
const localFilePath2 = path.join(__dirname, `../resources/${fileName2}`);
const text = fs.readFileSync(localFilePath, 'utf-8');
const text2 = fs.readFileSync(localFilePath2, 'utf-8');
const germanText = `Willkommen bei München`;

before(async () => {
  tools.checkCredentials();
  const [bucket] = await storage.createBucket(bucketName);
  await bucket.upload(localFilePath);
  await bucket.upload(localFilePath2);
});

after(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({force: true});
  await bucket.deleteFiles({force: true}); // Try a second time...
  await bucket.delete();
});

beforeEach(async () => tools.stubConsole);
afterEach(async () => tools.restoreConsole);

it(`should analyze sentiment in text`, async () => {
  const output = await tools.runAsync(`${cmd} sentiment-text "${text}"`, cwd);
  assert(RegExp(`Document sentiment:`).test(output));
  assert(RegExp(`Sentence: ${text}`).test(output));
  assert(RegExp(`Score: 0`).test(output));
  assert(RegExp(`Magnitude: 0`).test(output));
});

it(`should analyze sentiment in a file`, async () => {
  const output = await tools.runAsync(
    `${cmd} sentiment-file ${bucketName} ${fileName}`,
    cwd
  );
  assert(RegExp(`Document sentiment:`).test(output));
  assert(RegExp(`Sentence: ${text}`).test(output));
  assert(RegExp(`Score: 0`).test(output));
  assert(RegExp(`Magnitude: 0`).test(output));
});

it(`should analyze entities in text`, async () => {
  const output = await tools.runAsync(`${cmd} entities-text "${text}"`, cwd);
  assert(RegExp(`Obama`).test(output));
  assert(RegExp(`Type: PERSON`).test(output));
  assert(RegExp(`White House`).test(output));
  assert(RegExp(`Type: LOCATION`).test(output));
});

it('should analyze entities in a file', async () => {
  const output = await tools.runAsync(
    `${cmd} entities-file ${bucketName} ${fileName}`,
    cwd
  );
  assert(RegExp(`Entities:`).test(output));
  assert(RegExp(`Type: PERSON`).test(output));
  assert(RegExp(`White House`).test(output));
  assert(RegExp(`Type: LOCATION`).test(output));
});

it(`should analyze syntax in text`, async () => {
  const output = await tools.runAsync(`${cmd} syntax-text "${text}"`, cwd);
  assert(RegExp(`Parts of speech:`).test(output));
  assert(RegExp(`NOUN:`).test(output));
  assert(RegExp(`President`).test(output));
  assert(RegExp(`Obama`).test(output));
  assert(RegExp(`Morphology:`).test(output));
  assert(RegExp(`tag: 'NOUN'`).test(output));
});

it('should analyze syntax in a file', async () => {
  const output = await tools.runAsync(
    `${cmd} syntax-file ${bucketName} ${fileName}`,
    cwd
  );
  assert(RegExp(`NOUN:`).test(output));
  assert(RegExp(`President`).test(output));
  assert(RegExp(`Obama`).test(output));
  assert(RegExp(`Morphology:`).test(output));
  assert(RegExp(`tag: 'NOUN'`).test(output));
});

it('should analyze syntax in a 1.1 language (German)', async () => {
  const output = await tools.runAsync(
    `${cmd} syntax-text "${germanText}"`,
    cwd
  );
  assert(RegExp(`Parts of speech:`).test(output));
  assert(RegExp(`ADV: Willkommen`).test(output));
  assert(RegExp(`ADP: bei`).test(output));
  assert(RegExp(`NOUN: München`).test(output));
});

it('should classify text in a file', async () => {
  const output = await tools.runAsync(
    `${cmd} classify-file ${bucketName} ${fileName2}`,
    cwd
  );
  assert(RegExp(`Name:`).test(output));
  assert(RegExp(`Computers & Electronics`).test(output));
});

it('should classify text in text', async () => {
  const output = await tools.runAsync(`${cmd} classify-text "${text2}"`, cwd);
  assert(RegExp(`Name:`).test(output));
  assert(RegExp(`Computers & Electronics`).test(output));
});
