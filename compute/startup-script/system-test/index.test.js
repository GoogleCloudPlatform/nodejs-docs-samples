/**
 * Copyright 2018, Google, Inc.
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

const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require('uuid');

const example = require(`../index`);

test.before(tools.checkCredentials);
test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.cb(`should list vms`, t => {
  example.list((err, result) => {
    t.ifError(err);
    t.truthy(result);
    t.true(Array.isArray(result));
    t.end();
  });
});

test.cb(`should create vm`, t => {
  const TESTS_PREFIX = 'gcloud-tests-';
  const name = generateName('vm-with-apache');

  function generateName(customPrefix) {
    return [TESTS_PREFIX, customPrefix + '-', uuid.v4().replace('-', '')]
      .join('')
      .substr(0, 61);
  }

  example.create(name, (err, result) => {
    t.ifError(err);
    t.truthy(result);

    // Clean up newly created vm.
    example.delete(name, (err, result) => {
      t.ifError(err);
      t.truthy(result);
      t.end();
    });
  });
});
