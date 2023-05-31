// Copyright 2023 Google LLC
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

// [START functions_stream_bigquery]

// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();
const functions = require('@google-cloud/functions-framework');
async function processRows(rows, res) {
  for (const row of rows) {
    res.write(row['abstract'] + '\n');
  }
}
/**
 * HTTP Cloud Function that streams BigQuery query results
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('streamBigQuery', async (req, res) => {
  // Define the SQL query
  const sqlQuery = `
      SELECT abstract 
            FROM \`bigquery-public-data.breathe.bioasq\` 
            LIMIT 1000`;
  const options = {
    query: sqlQuery,
    location: 'US', // Location must match that of the dataset(s) referenced in the query.
  };

  try {
    // Execute the query
    const [rows] = await bigquery.query(options);
    await processRows(rows, res);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error querying BigQuery: ${err}`);
  }
});

// [END functions_stream_bigquery]
