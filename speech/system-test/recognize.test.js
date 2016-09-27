// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const path = require(`path`);
const run = require(`../../utils`).run;

const cmd = `node recognize.js`;
const cwd = path.join(__dirname, `..`);
const filename = `./resources/audio.raw`;
const text = `how old is the Brooklyn Bridge`;

describe(`speech:recognize`, () => {
  it(`should run sync recognize`, () => {
    assert.equal(run(`${cmd} sync ${filename}`, cwd), `Results: ${text}`);
  });

  it(`should run async recognize`, () => {
    assert.equal(run(`${cmd} async ${filename}`, cwd), `Results: ${text}`);
  });

  it(`should run streaming recognize`, () => {
    assert.notEqual(run(`${cmd} stream ${filename}`, cwd).indexOf(text), -1);
  });
});
