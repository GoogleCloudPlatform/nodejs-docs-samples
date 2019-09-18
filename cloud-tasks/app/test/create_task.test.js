/**
 * Copyright 2019 Google LLC
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

const createHttpTaskWithToken = require('../createTask');
const {assert} = require('chai');

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const SERVICE_ACCOUNT =
  'test-run-invoker@long-door-651.iam.gserviceaccount.com';

describe('Cloud Task Sample Tests', () => {
  it('should create a task', async () => {
    const queue = 'my-appengine-queue';
    const location = 'us-central1';
    const url = 'https://example.com/taskhandler';

    const response = await createHttpTaskWithToken(
      PROJECT_ID,
      queue,
      location,
      url,
      SERVICE_ACCOUNT
    );
    assert.match(response, /projects/);
  });
});
