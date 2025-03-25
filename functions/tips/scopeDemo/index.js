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

// [START functions_tips_scopes]
// [START cloudrun_tips_global_scope]
const functions = require('@google-cloud/functions-framework');

// TODO(developer): Define your own computations
const {lightComputation, heavyComputation} = require('./computations');

// Global (instance-wide) scope
// This computation runs once (at instance cold-start)
const instanceVar = heavyComputation();

/**
 * HTTP function that declares a variable.
 *
 * @param {Object} req request context.
 * @param {Object} res response context.
 */
functions.http('scopeDemo', (req, res) => {
  // Per-function scope
  // This computation runs every time this function is called
  const functionVar = lightComputation();

  res.send(`Per instance: ${instanceVar}, per function: ${functionVar}`);
});
// [END cloudrun_tips_global_scope]
// [END functions_tips_scopes]
