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

const path = require('path');
const test = require('ava');
const {runAsync} = require('@google-cloud/nodejs-repo-tools');

const cmd = 'node detect.js';
const audioFilepathBookARoom = path
  .join(__dirname, `../resources/book_a_room.wav`)
  .replace(/(\s+)/g, '\\$1');

test('Should detect text queries', async t => {
  const output = await runAsync(`${cmd} text -q "hello"`);
  t.true(output.includes('Detected intent'));
});

test('Should detect event query', async t => {
  const output = await runAsync(`${cmd} event WELCOME`);
  t.true(output.includes('Query: WELCOME'));
});

test('Should detect audio query', async t => {
  const output = await runAsync(
    `${cmd} audio ${audioFilepathBookARoom} -r 16000`
  );
  t.true(output.includes('Detected intent'));
});

test('Should detect audio query in streaming fashion', async t => {
  const output = await runAsync(
    `${cmd} stream ${audioFilepathBookARoom} -r 16000`
  );
  t.true(output.includes('Detected intent'));
});
