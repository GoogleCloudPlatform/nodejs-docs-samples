// Copyright 2020 Google LLC
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

// [START bigtable_functions_quickstart]
// Imports the Google Cloud client library
const {Bigtable} = require('@google-cloud/bigtable');

// Instantiates a client
const bigtable = new Bigtable();

// Your Cloud Bigtable instance ID
const instanceId = 'your-instance';

// Your Cloud Bigtable table ID
const tableId = 'mobile-time-series';

/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.get = async (req, res) => {
  // Gets a reference to a Cloud Bigtable instance and database
  const instance = bigtable.instance(instanceId);
  const table = instance.table(tableId);

  // Execute the query
  try {
    const prefix = 'phone#';
    let rows = [];
    await table
        .createReadStream({
          prefix,
        })
        .on('error', err => {
          res.send(`Error querying Bigtable: ${err}`);
          res.status(500).end();
        })
        .on('data', row => {
          rows.push(
              `rowkey: ${row.id}, ` +
              `os_build: ${row.data["stats_summary"]["os_build"][0].value}\n`
          )
        }).on('end', () => {
          rows.forEach(r => res.write(r));
          res.status(200).end();
        });
  } catch (err) {
    res.send(`Error querying Bigtable: ${err}`);
    res.status(500).end();
  }
};
// [END bigtable_functions_quickstart]