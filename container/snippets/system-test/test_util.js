// Copyright 2022 Google LLC
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

const container = require('@google-cloud/container');
const STATUS_ENUM = container.protos.google.container.v1.Operation.Status;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const maxRetries = 20;
let retryCount;
let prevDelay;
let currDelay;

/**
 * We use a custom wait and retry method for the test cases, which is different
 * from the approach we have for the samples itself. The samples use an async
 * function with delayed setIntervals. Since, the last function call of the
 * samples is the wait for the long running operation to complete, the program
 * waits until the delayed setInterval async functions resolve.
 *
 * However, when running the tests we have certain setup to be done in the
 * before() hook which are also long running operations. We would want to block
 * until these setup steps are fully complete before allowing for the tests to
 * start. If we use the same approach used in the samples (with an async
 * function scheduled on setIntervals), the before() hook will not block. Rather
 * it will return and the tests will start running.
 *
 * To prevent this scenario, we have employed a sleep based retry and wait
 * method below to be used only for the test cases.
 *
 * @param {container.v1.ClusterManagerClient} client the google cloud API client used to submit the request
 * @param {string} opIdentifier the unique identifier of the operation we want to check
 */
async function retryUntilDone(client, opIdentifier) {
  retryCount = 0;
  prevDelay = 0;
  currDelay = 1000;

  while (retryCount <= maxRetries) {
    const [longRunningOp] = await client.getOperation({name: opIdentifier});
    const status = longRunningOp.status;
    if (status !== STATUS_ENUM[STATUS_ENUM.DONE]) {
      const fibonacciDelay = prevDelay + currDelay;
      prevDelay = currDelay;
      currDelay = fibonacciDelay;
      await sleep(fibonacciDelay);
    } else {
      break;
    }
    retryCount += 1;
  }
}

module.exports = retryUntilDone;
