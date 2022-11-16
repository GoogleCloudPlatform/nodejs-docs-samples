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

// [START functions_tips_scopes]
// [START cloudrun_tips_global_scope]
// [START run_tips_global_scope]
// Global (instance-wide) scope
// This computation runs at instance cold-start
const instanceVar = heavyComputation();

/**
 * HTTP function that declares a variable.
 *
 * @param {Object} req request context.
 * @param {Object} res response context.
 */
exports.scopeDemo = (req, res) => {
  // Per-function scope
  // This computation runs every time this function is called
  const functionVar = lightComputation();

  res.send(`Per instance: ${instanceVar}, per function: ${functionVar}`);
};
// [END run_tips_global_scope]
// [END cloudrun_tips_global_scope]
// [END functions_tips_scopes]
