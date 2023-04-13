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

// [START functions_hello_bigquery]
// Import the Google Cloud client library
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const functions = require('@google-cloud/functions-framework');

/**
 * HTTP Cloud Function that returns BigQuery query results
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
functions.http('helloBigQuery', async (req, res) => {
  // Define the SQL query
  // Queries the public Shakespeare dataset using named query parameter
  const sqlQuery = `
      SELECT word, word_count
            FROM \`bigquery-public-data.samples.shakespeare\`
            WHERE corpus = @corpus
            AND word_count >= @min_word_count
            ORDER BY word_count DESC`;

  const options = {
    query: sqlQuery,
    // Location must match that of the dataset(s) referenced in the query.
    location: 'US',
    params: {corpus: 'romeoandjuliet', min_word_count: 400},
  };

  // Execute the query
  try {
    const [rows] = await bigquery.query(options);
    // Send the results
    res.status(200).send(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send(`Error querying BigQuery: ${err}`);
  }
});
// [END functions_hello_bigquery]
