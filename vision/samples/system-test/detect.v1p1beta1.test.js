// Copyright 2017 Google LLC
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

const path = require('path');
const cp = require('child_process');
const {assert} = require('chai');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = `node detect.v1p1beta1.js`;
const files = [`text.jpg`, `wakeupcat.jpg`, `landmark.jpg`, `city.jpg`].map(
  name => {
    return {
      name,
      localPath: path.resolve(path.join(__dirname, `../resources/${name}`)),
    };
  }
);

describe(`detect v1 p1 beta1`, () => {
  it(`should extract text from image file and print confidence`, async () => {
    const output = execSync(`${cmd} fulltext ${files[0].localPath}`);
    assert.match(output, /Word text: class/);
    assert.match(output, /Word confidence:/);
  });

  it(`should detect safe search properties from image file`, async () => {
    const output = execSync(`${cmd} safe-search ${files[1].localPath}`);
    assert.match(output, /VERY_LIKELY/);
    assert.match(output, /Racy:/);
  });

  it(`should detect web entities including best guess labels`, async () => {
    const output = execSync(`${cmd} web ${files[2].localPath}`);
    assert.match(output, /Best guess label: palace of fine arts/);
  });

  it(`should detect web entities using geographical metadata`, async () => {
    const output = execSync(`${cmd} web-entities-geo ${files[3].localPath}`);
    assert.match(output, /Score:/);
  });
});
