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

const app = require('./server.js');

/**
 * Responds to GET and POST requests for TABS vs SPACES sample app.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
 exports.votes = (req, res) => {
    //console.log('req.method', req.method);
    switch (req.method) {
      case 'GET':
        //app.get(req, res);
        app.httpget(req, res);
        break;
      case 'POST':
        //app.post(req, res);
        app.httppost(req, res);
        break;
      default:
        res.status(405).send({error: 'Something blew up!'});
        break;
    } 
  };
