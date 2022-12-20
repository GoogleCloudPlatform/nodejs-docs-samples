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

// [START functions_concepts_filesystem]
const fs = require('fs');
const functions = require('@google-cloud/functions-framework');

/**
 * HTTP Cloud Function that lists files in the function directory
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('listFiles', (req, res) => {
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      console.log('Files', files);
      res.sendStatus(200);
    }
  });
});
// [END functions_concepts_filesystem]
