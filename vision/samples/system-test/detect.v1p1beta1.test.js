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
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node detect.v1p1beta1.js`;
const cwd = path.join(__dirname, `..`);
const files = [`text.jpg`, `wakeupcat.jpg`, `landmark.jpg`, `city.jpg`].map(
  name => {
    return {
      name,
      localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
    };
  }
);

test.before(tools.checkCredentials);

test(`should extract text from image file and print confidence`, async t => {
  const output = await tools.runAsync(
    `${cmd} fulltext ${files[0].localPath}`,
    cwd
  );
  t.true(output.includes('Word text: class'));
  t.true(output.includes('Word confidence:'));
});

test(`should detect safe search properties from image file`, async t => {
  const output = await tools.runAsync(
    `${cmd} safe-search ${files[1].localPath}`,
    cwd
  );
  t.true(output.includes('VERY_LIKELY'));
  t.true(output.includes('Racy:'));
});

test(`should detect web entities including best guess labels`, async t => {
  const output = await tools.runAsync(`${cmd} web ${files[2].localPath}`, cwd);
  t.true(output.includes('Description: Palace of Fine Arts Theatre'));
  t.true(output.includes('Best guess label: palace of fine arts'));
});

test(`should detect web entities using geographical metadata`, async t => {
  const output = await tools.runAsync(
    `${cmd} web-entities-geo ${files[3].localPath}`,
    cwd
  );
  t.true(output.includes('Electra'));
});
