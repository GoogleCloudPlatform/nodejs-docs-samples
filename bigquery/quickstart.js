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

// [START bigquery_quickstart]
// Imports and instantiates the Google Cloud client library
// for Google BigQuery
const bigquery = require('@google-cloud/bigquery')({
  projectId: 'YOUR_PROJECT_ID'
});

// Creates a new dataset
bigquery.createDataset('my_new_dataset', (err, dataset) => {
  if (!err) {
    // The dataset was created successfully
  }
});
// [END bigquery_quickstart]
