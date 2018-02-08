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

// [START functions_storage_unit_test]
const test = require(`ava`);
const uuid = require(`uuid`);
const sinon = require(`sinon`);

const helloGCS = require(`..`).helloGCS;
const consoleLog = sinon.stub(console, 'log');

test.cb(`helloGCS: should print uploaded message`, t => {
  t.plan(1);

  // Initialize mocks
  const filename = uuid.v4();
  const event = {
    data: {
      name: filename,
      resourceState: 'exists',
      metageneration: '1'
    }
  };

  // Call tested function and verify its behavior
  helloGCS(event, () => {
    t.true(consoleLog.calledWith(`File ${filename} uploaded.`));
    t.end();
  });
});

test.cb(`helloGCS: should print metadata updated message`, t => {
  t.plan(1);

  // Initialize mocks
  const filename = uuid.v4();
  const event = {
    data: {
      name: filename,
      resourceState: 'exists',
      metageneration: '2'
    }
  };

  // Call tested function and verify its behavior
  helloGCS(event, () => {
    t.true(consoleLog.calledWith(`File ${filename} metadata updated.`));
    t.end();
  });
});

test.cb(`helloGCS: should print deleted message`, t => {
  t.plan(1);

  // Initialize mocks
  const filename = uuid.v4();
  const event = {
    data: {
      name: filename,
      resourceState: 'not_exists',
      metageneration: '3'
    }
  };

  // Call tested function and verify its behavior
  helloGCS(event, () => {
    t.true(consoleLog.calledWith(`File ${filename} deleted.`));
    t.end();
  });
});
// [END functions_storage_unit_test]
