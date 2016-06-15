// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

/**
 * Responds to a GET request.
 *
 * @example
 * gcloud alpha functions call helloGET
 *
 * @param {Object} req Cloud Function request context.
 * @param {string} req.method HTTP method of the request.
 * @param {Object} res Cloud Function response context.
 * @param {Function} res.send Write data to the response stream.
 * @param {Function} res.status Set the status of the response.
 */
function helloGET (req, res) {
  console.log(req.method);
  switch (req.method) {
    case 'GET':
      res.send('Hello World!');
      break;
    case 'POST':
      res.status(403).send('Forbidden!');
      break;
    default:
      res.status(500).send({ error: 'Something blew up!' });
      break;
  }
}

exports.helloGET = helloGET;
