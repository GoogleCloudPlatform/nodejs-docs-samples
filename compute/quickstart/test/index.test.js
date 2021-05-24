// Copyright 2021 Google LLC
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

const compute = require('@google-cloud/compute');
const assert = require('assert');
const {describe, it} = require('mocha');

const quickstart = require('../');

function captureStream(stream) {
  const oldWrite = stream.write;
  let buf = '';

  stream.write = function (chunk) {
    buf += chunk.toString();
    oldWrite.apply(stream, arguments);
  };

  return {
    unhook: function unhook() {
      stream.write = oldWrite;
    },
    captured: function () {
      return buf;
    },
  };
}

describe('quickstart', () => {
  let hook;

  beforeEach(() => {
    hook = captureStream(process.stdout);
  });

  afterEach(() => {
    hook.unhook();
  });

  it('should run base scenarion without errors', async () => {
    const client = new compute.InstancesClient({fallback: 'rest'});

    const PROJECT_ID = await client.getProjectId();
    const ZONE = 'europe-central2-b';
    const INSTANCE_NAME = `test-${Math.random().toString(36).substring(5)}`;

    await quickstart.main(PROJECT_ID, ZONE, INSTANCE_NAME);

    const std = hook.captured();

    assert(std.includes(`Instance ${INSTANCE_NAME} created.`));
    assert(std.includes(`Instance ${INSTANCE_NAME} deleted.`));
  });
});
