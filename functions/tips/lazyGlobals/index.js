// Copyright 2018 Google LLC
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

const lightComputation = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.reduce((t, x) => t + x);
};

const heavyComputation = () => {
  // Multiplication is more computationally expensive than addition
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.reduce((t, x) => t * x);
};

const functionSpecificComputation = heavyComputation;
const fileWideComputation = lightComputation;

// [START functions_tips_lazy_globals]
// [START cloudrun_tips_global_lazy]
const functions = require('@google-cloud/functions-framework');

// Always initialized (at cold-start)
const nonLazyGlobal = fileWideComputation();

// Declared at cold-start, but only initialized if/when the function executes
let lazyGlobal;

/**
 * HTTP function that uses lazy-initialized globals
 *
 * @param {Object} req request context.
 * @param {Object} res response context.
 */
functions.http('lazyGlobals', (req, res) => {
  // This value is initialized only if (and when) the function is called
  lazyGlobal = lazyGlobal || functionSpecificComputation();

  res.send(`Lazy global: ${lazyGlobal}, non-lazy global: ${nonLazyGlobal}`);
});
// [END cloudrun_tips_global_lazy]
// [END functions_tips_lazy_globals]
