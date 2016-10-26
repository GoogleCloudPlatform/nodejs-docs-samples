/**
 * Copyright 2016, Google, Inc.
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

// [START bigquery_quickstart]
// Imports the Google Cloud client library
const BigQuery = require('@google-cloud/bigquery');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const bigquery = BigQuery({
  projectId: projectId
});

// The name for the new dataset
const datasetName = 'my_new_dataset';

// Creates the new dataset
bigquery.createDataset(datasetName)
  .then((results) => {
    const dataset = results[0];

    console.log(`Dataset ${dataset.id} created.`);
  });
// [END bigquery_quickstart]
