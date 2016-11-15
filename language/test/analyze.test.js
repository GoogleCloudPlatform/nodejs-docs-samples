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

const program = require(`../analyze`);

describe(`language:analyze`, () => {
  it(`should have expected exports`, () => {
    assert.equal(typeof program.analyzeSentimentOfText, `function`);
    assert.equal(typeof program.analyzeSentimentInFile, `function`);
    assert.equal(typeof program.analyzeEntitiesOfText, `function`);
    assert.equal(typeof program.analyzeEntitiesInFile, `function`);
    assert.equal(typeof program.analyzeSyntaxOfText, `function`);
    assert.equal(typeof program.analyzeSyntaxInFile, `function`);
  });
});
