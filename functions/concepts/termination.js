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

/* eslint-disable */

exports.nodeTermination = async (event, context) => {
  // [START functions_concepts_node_termination]
  // These will cause background tasks to stop executing immediately
  return 1; // Returning a value
  return (await Promise.resolve()); // Returning the result of a promise
  return (await Promise.reject()); // Same behavior as resolved promises

  // These will wait until the related background task finishes
  return Promise.resolve(); // Returning the promise itself
  return Promise.reject(); // Same behavior as to-be-resolved promises
  // [END functions_concepts_node_termination]
};
