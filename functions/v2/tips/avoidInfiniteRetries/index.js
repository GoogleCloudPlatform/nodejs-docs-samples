// Copyright 2023 Google LLC
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

// [START functions_cloudevent_tips_infinite_retries]
const functions = require('@google-cloud/functions-framework');

/**
 * Cloud Event Function that only executes within
 * a certain time period after the triggering event
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
functions.cloudEvent('avoidInfiniteRetries', (event, callback) => {
  const eventAge = Date.now() - Date.parse(event.time);
  const eventMaxAge = 10000;

  // Ignore events that are too old
  if (eventAge > eventMaxAge) {
    console.log(`Dropping event ${event} with age ${eventAge} ms.`);
    callback();
    return;
  }

  // Do what the function is supposed to do
  console.log(`Processing event ${event} with age ${eventAge} ms.`);

  // Retry failed function executions
  const failed = false;
  if (failed) {
    callback('some error');
  } else {
    callback();
  }
});
// [END functions_cloudevent_tips_infinite_retries]
