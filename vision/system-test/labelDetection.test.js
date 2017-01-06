/**
 * Copyright 2016, Google, Inc.
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

require(`../../system-test/_setup`);

const path = require(`path`);

const labelDetectionSample = require(`../labelDetection`);
const inputFile = path.join(__dirname, `../resources`, `cat.jpg`);

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should detect labels`, (t) => {
  labelDetectionSample.main(inputFile, (err, labels) => {
    t.ifError(err);
    t.true(labels.length > 0);
    t.true(console.log.calledWith(`Found label: cat for ${inputFile}`));
    t.end();
  });
});
