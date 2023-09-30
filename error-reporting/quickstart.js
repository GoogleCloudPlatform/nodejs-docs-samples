// Copyright 2017 Google LLC
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

// [START error_reporting_quickstart]
// Import the Google Cloud client library
const {ErrorReporting} = require('@google-cloud/error-reporting');

function quickstart() {
  try {
    throw new Error('Something went wrong');
  } catch (exception) {
    reportError(exception);
  }
}

function reportError(exception) {
  // Instantiates a client
  const errors = new ErrorReporting();

  // Reports an exception
  errors.report(exception.stack);
}
// [END error_reporting_quickstart]

quickstart();
