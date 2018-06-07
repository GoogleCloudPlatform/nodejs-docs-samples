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

// [START functions_pubsub_unit_test]
const test = require(`ava`);
const uuid = require(`uuid`);
const sinon = require(`sinon`);

const helloPubSub = require(`..`).helloPubSub;
const consoleLog = sinon.stub(console, 'log');

test.cb(`helloPubSub: should print a name`, t => {
  t.plan(1);

  // Initialize mocks
  const name = uuid.v4();
  const event = {
    data: {
      data: Buffer.from(name).toString(`base64`)
    }
  };

  // Call tested function and verify its behavior
  helloPubSub(event, () => {
    t.true(consoleLog.calledWith(`Hello, ${name}!`));
    t.end();
  });
});

test.cb(`helloPubSub: should print hello world`, t => {
  t.plan(1);

  // Initialize mocks
  const event = {
    data: {}
  };

  // Call tested function and verify its behavior
  helloPubSub(event, () => {
    t.true(consoleLog.calledWith(`Hello, World!`));
    t.end();
  });
});
// [END functions_pubsub_unit_test]
