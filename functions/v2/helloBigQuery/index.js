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

// [START cloudfunctions_hello_bigquery]
const {BigQuery} = require('@google-cloud/bigquery');
const bigquery = new BigQuery();

const functions = require('@google-cloud/functions-framework');

functions.http('helloBigQuery', async (req, res) => {
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

  // Run the query
  const [rows] = await bigquery.query(options);

  console.log('Rows:');
  rows.forEach(row => console.log(row));

  const results =
    'top result is the word: ' +
    rows[0].word +
    ', occurring ' +
    rows[0].word_count +
    ' times.';

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send(results);
});
// [END cloudfunctions_hello_bigquery]
