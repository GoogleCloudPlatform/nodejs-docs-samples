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

require(`../../../test/_setup`);

const path = require(`path`);
const proxyquire = require(`proxyquire`).noPreserveCache();
const request = require(`supertest`);

const SAMPLE_PATH = path.join(__dirname, `../app.js`);

function getSample () {
  const app = proxyquire(SAMPLE_PATH, {});
  return {
    app: app,
    mocks: {}
  };
}

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.cb(`should render index page`, (t) => {
  const sample = getSample();
  const expectedResult = `Hello World! Express.js on Google App Engine.`;

  request(sample.app)
    .get(`/`)
    .expect(200)
    .expect((response) => {
      t.true(response.text.includes(expectedResult));
    })
    .end(t.end);
});

test.cb(`should render users page`, (t) => {
  const sample = getSample();
  const expectedResult = `respond with a resource`;

  request(sample.app)
    .get(`/users`)
    .expect(200)
    .expect((response) => {
      t.true(response.text.includes(expectedResult));
    })
    .end(t.end);
});

test.cb(`should catch 404`, (t) => {
  const sample = getSample();
  const expectedResult = `Error: Not Found`;

  request(sample.app)
    .get(`/doesnotexist`)
    .expect(404)
    .expect((response) => {
      t.true(response.text.includes(expectedResult));
    })
    .end(t.end);
});
