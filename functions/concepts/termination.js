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

/* eslint-disable no-unused-vars, no-unreachable */

exports.backgroundTermination = async (event, context) => {
  // [START functions_concepts_node_termination]
  // Await-ing promises within functions is OK if you don't return anything
  await Promise.resolve();

  // These will cause background tasks to stop executing immediately
  return 1; // OK: returning a value
  return await Promise.resolve(); // WRONG: returning the result of a promise
  return await Promise.reject(); // WRONG: same behavior as resolved promises

  // These will wait until the related background task finishes
  return Promise.resolve(); // OK: returning the promise itself
  return Promise.reject(); // OK: same behavior as to-be-resolved promises
  // [END functions_concepts_node_termination]
};

exports.httpTermination = async (req, res) => {
  // [START functions_concepts_node_termination_http]
  // OK: await-ing a Promise before sending an HTTP response
  await Promise.resolve();

  // WRONG: HTTP functions should send an
  // HTTP response instead of returning.
  return Promise.resolve();

  // HTTP functions should signal termination by returning an HTTP response.
  // This should not be done until all background tasks are complete.
  res.send(200);
  res.end();

  // WRONG: this may not execute since an
  // HTTP response has already been sent.
  return Promise.resolve();
  // [END functions_concepts_node_termination_http]
};
