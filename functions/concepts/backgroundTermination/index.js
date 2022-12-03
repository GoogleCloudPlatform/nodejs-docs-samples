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

/* eslint-disable no-unused-vars, no-unreachable */

exports.backgroundTermination = async (event, context) => {
  // [START functions_concepts_node_termination]
  // Await-ing promises within functions is OK if you don't return anything
  await Promise.resolve();

  // These will cause background tasks to stop executing immediately
  return 1; // OK: returning a value

  // These will wait until the related background task finishes
  return Promise.resolve(); // OK: returning the promise itself
  return await Promise.resolve(); // Same as above
  return Promise.reject(); // OK: same behavior as to-be-resolved promises
  return await Promise.reject(); // Same as above
  // [END functions_concepts_node_termination]
};
