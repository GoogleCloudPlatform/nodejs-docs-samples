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

const cwd = path.join(__dirname, `..`);
const cmd = `node queries.js`;

const expectedShakespeareResult = `Query Results:
corpus: hamlet
unique_words: 5318
corpus: kinghenryv
unique_words: 5104
corpus: cymbeline
unique_words: 4875
corpus: troilusandcressida
unique_words: 4795
corpus: kinglear
unique_words: 4784
corpus: kingrichardiii
unique_words: 4713
corpus: 2kinghenryvi
unique_words: 4683
corpus: coriolanus
unique_words: 4653
corpus: 2kinghenryiv
unique_words: 4605
corpus: antonyandcleopatra
unique_words: 4582`;

const sqlQuery = `SELECT * FROM publicdata.samples.natality LIMIT 5;`;

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test(`should query shakespeare`, async (t) => {
  const output = await runAsync(`${cmd} shakespeare`, cwd);
  t.is(output, expectedShakespeareResult);
});

test(`should run a sync query`, async (t) => {
  const output = await runAsync(`${cmd} sync "${sqlQuery}"`, cwd);
  t.true(output.includes(`Rows:`));
  t.true(output.includes(`source_year`));
});

test(`should run an async query`, async (t) => {
  const output = await runAsync(`${cmd} async "${sqlQuery}"`, cwd);
  t.true(output.includes(`Rows:`));
  t.true(output.includes(`source_year`));
});
