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

// Retrieve Job-defined env vars
const {TASK_NUM = 0, ATTEMPT_NUM = 0} = process.env;
// Retrieve User-defined env vars
const {SLEEP_MS, FAIL_RATE} = process.env;

// Define main script
const main = async () => {
  console.log(`Starting Task #${TASK_NUM}, Attempt #${ATTEMPT_NUM}...`);
  // Simulate work
  if (SLEEP_MS) {
    await sleep(SLEEP_MS);
  }
  // Simulate errors
  if (FAIL_RATE) {
    try {
      randomFailure(FAIL_RATE);
    } catch (err) {
      err.message = `Task #${TASK_NUM}, Attempt #${ATTEMPT_NUM} failed.\n\n${err.message}`;
      throw err;
    }
  }
  console.log(`Completed Task #${TASK_NUM}.`);
};

// Wait for a specific amount of time
const sleep = ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Throw an error based on fail rate
const randomFailure = rate => {
  rate = parseFloat(rate);
  if (!rate || rate < 0 || rate > 1) {
    console.warn(
      `Invalid FAIL_RATE env var value: ${rate}. Must be a float between 0 and 1 inclusive.`
    );
    return;
  }

  const randomFailure = Math.random();
  if (randomFailure < rate) {
    throw new Error('Task failed.');
  }
};

// Start script
main().catch(err => {
  console.error(err);
  process.exit(1); // Retry Job Task by exiting the process
});
