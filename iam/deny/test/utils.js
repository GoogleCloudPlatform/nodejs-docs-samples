/*
 * Copyright 2026 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

/**
 * Checks whether an error is caused by missing IAM permissions (gRPC code 7 / PERMISSION_DENIED).
 * @param {Error|Object} err
 * @returns {boolean}
 */
function isPermissionDenied(err) {
  return (
    err?.code === 7 ||
    err?.message?.includes('PERMISSION_DENIED') ||
    err?.stderr?.includes('PERMISSION_DENIED') ||
    err?.details?.includes('denied')
  );
}

/**
 * Handles test errors by skipping when permissions are missing, or re-throwing otherwise.
 * Must be called with the Mocha context as `this`.
 *
 * Usage inside an `it` or hook (using `function ()` syntax):
 *   handlePermissionError.call(this, err);
 *
 * @param {Error|Object} err
 * @param {string} [customMessage]
 */
function handlePermissionError(err, customMessage) {
  if (isPermissionDenied(err)) {
    const msg =
      customMessage || 'Missing IAM permissions to run this test. Skipping.';
    console.error(msg);
    this.skip();
  } else {
    throw err;
  }
}

module.exports = {
  isPermissionDenied,
  handlePermissionError,
};
