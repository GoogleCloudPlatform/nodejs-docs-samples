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

// [START functions_concepts_stateless]
// Global variable, but only shared within function instance.
let count = 0;

/**
 * HTTP Cloud Function that counts how many times
 * it is executed within a specific instance.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.executionCount = (req, res) => {
  count++;

  // Note: the total function invocation count across
  // all instances may not be equal to this value!
  res.send(`Instance execution count: ${count}`);
};
// [END functions_concepts_stateless]
