/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START spanner_functions_quickstart]
// Imports the Google Cloud client library
const Spanner = require('@google-cloud/spanner');

// Instantiates a client
const spanner = Spanner();

// Your Cloud Spanner instance ID
const instanceId = 'test-instance';

// Your Cloud Spanner database ID
const databaseId = 'example-db';

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.get = (req, res) => {
  // Gets a reference to a Cloud Spanner instance and database
  const instance = spanner.instance(instanceId);
  const database = instance.database(databaseId);

  // The query to execute
  const query = {
    sql: 'SELECT * FROM Albums'
  };

  // Execute the query
  return database.run(query)
    .then((results) => {
      const rows = results[0].map((row) => row.toJSON());
      rows.forEach((row) => {
        res.write(`SingerId: ${row.SingerId.value}, AlbumId: ${row.AlbumId.value}, AlbumTitle: ${row.AlbumTitle}\n`);
      });
      res
        .status(200)
        .end();
    })
    .catch((err) => {
      res
        .status(500)
        .send(`Error querying Spanner: ${err}`)
        .end();
    });
};
// [END spanner_functions_quickstart]
