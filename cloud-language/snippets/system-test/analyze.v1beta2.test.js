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

const path = require(`path`);
const storage = require(`@google-cloud/storage`)();
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const cmd = `node analyze.v1beta2.js`;
const cwd = path.join(__dirname, `..`);
const bucketName = `nodejs-docs-samples-test-${uuid.v4()}`;
const fileName = `text.txt`;
const localFilePath = path.join(__dirname, `../resources/text.txt`);
const text = `President Obama is speaking at the White House.`;
const germanText = `Willkommen bei München`;

test.before(async () => {
  tools.checkCredentials();
  const [bucket] = await storage.createBucket(bucketName);
  await bucket.upload(localFilePath);
});

test.after.always(async () => {
  const bucket = storage.bucket(bucketName);
  await bucket.deleteFiles({ force: true });
  await bucket.deleteFiles({ force: true }); // Try a second time...
  await bucket.delete();
});

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test(`should analyze sentiment in text`, async (t) => {
  const output = await tools.runAsync(`${cmd} sentiment-text "${text}"`, cwd);
  t.regex(output, new RegExp(`Document sentiment:`));
  t.regex(output, new RegExp(`Sentence: ${text}`));
  t.regex(output, new RegExp(`Score: 0`));
  t.regex(output, new RegExp(`Magnitude: 0`));
});

test(`should analyze sentiment in a file`, async (t) => {
  const output = await tools.runAsync(`${cmd} sentiment-file ${bucketName} ${fileName}`, cwd);
  t.regex(output, new RegExp(`Document sentiment:`));
  t.regex(output, new RegExp(`Sentence: ${text}`));
  t.regex(output, new RegExp(`Score: 0`));
  t.regex(output, new RegExp(`Magnitude: 0`));
});

test(`should analyze entities in text`, async (t) => {
  const output = await tools.runAsync(`${cmd} entities-text "${text}"`, cwd);
  t.regex(output, new RegExp(`Obama`));
  t.regex(output, new RegExp(`Type: PERSON`));
  t.regex(output, new RegExp(`White House`));
  t.regex(output, new RegExp(`Type: LOCATION`));
});

test('should analyze entities in a file', async (t) => {
  const output = await tools.runAsync(`${cmd} entities-file ${bucketName} ${fileName}`, cwd);
  t.regex(output, new RegExp(`Entities:`));
  t.regex(output, new RegExp(`Type: PERSON`));
  t.regex(output, new RegExp(`White House`));
  t.regex(output, new RegExp(`Type: LOCATION`));
});

test(`should analyze syntax in text`, async (t) => {
  const output = await tools.runAsync(`${cmd} syntax-text "${text}"`, cwd);
  t.regex(output, new RegExp(`Parts of speech:`));
  t.regex(output, new RegExp(`NOUN:`));
  t.regex(output, new RegExp(`President`));
  t.regex(output, new RegExp(`Obama`));
  t.regex(output, new RegExp(`Morphology:`));
  t.regex(output, new RegExp(`tag: 'NOUN'`));
});

test('should analyze syntax in a file', async (t) => {
  const output = await tools.runAsync(`${cmd} syntax-file ${bucketName} ${fileName}`, cwd);
  t.regex(output, new RegExp(`NOUN:`));
  t.regex(output, new RegExp(`President`));
  t.regex(output, new RegExp(`Obama`));
  t.regex(output, new RegExp(`Morphology:`));
  t.regex(output, new RegExp(`tag: 'NOUN'`));
});

test('should analyze syntax in a 1.1 language (German)', async (t) => {
  const output = await tools.runAsync(`${cmd} syntax-text "${germanText}"`, cwd);
  t.regex(output, new RegExp(`Parts of speech:`));
  t.regex(output, new RegExp(`ADV: Willkommen`));
  t.regex(output, new RegExp(`ADP: bei`));
  t.regex(output, new RegExp(`NOUN: München`));
});

test(`should analyze entity sentiment in text`, async (t) => {
  const output = await tools.runAsync(`${cmd} entity-sentiment-text "${text}"`, cwd);
  t.regex(output, new RegExp(`Entities and sentiments:`));
  t.regex(output, new RegExp(`Obama`));
  t.regex(output, new RegExp(`PERSON`));
  t.regex(output, new RegExp(`Score: 0`));
  t.regex(output, new RegExp(`Magnitude: 0`));
});

test('should analyze entity sentiment in a file', async (t) => {
  const output = await tools.runAsync(`${cmd} entity-sentiment-file ${bucketName} ${fileName}`, cwd);
  t.regex(output, new RegExp(`Entities and sentiments:`));
  t.regex(output, new RegExp(`Obama`));
  t.regex(output, new RegExp(`PERSON`));
  t.regex(output, new RegExp(`Score: 0`));
  t.regex(output, new RegExp(`Magnitude: 0`));
});
