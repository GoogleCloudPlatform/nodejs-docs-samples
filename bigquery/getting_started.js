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

// [START complete]
'use strict';

// [START auth]
// You must set the GOOGLE_APPLICATION_CREDENTIALS and GCLOUD_PROJECT
// environment variables to run this sample
var projectId = process.env.GCLOUD_PROJECT;

// Initialize gcloud
var gcloud = require('gcloud')({
  projectId: projectId
});

// Get a reference to the bigquery component
var bigquery = gcloud.bigquery();
// [END auth]

// [START print]
function printExample(rows) {
  console.log('Query Results:');
  rows.forEach(function (row) {
    var str = '';
    for (var key in row) {
      if (str) {
        str += '\t';
      }
      str += key + ': ' + row[key];
    }
    console.log(str);
  });
}
// [END print]

// [START query]
/**
 * Run an example query.
 *
 * @param {Function} callback Callback function.
 */
function queryExample(callback) {
  var query = 'SELECT TOP(corpus, 10) as title, COUNT(*) as unique_words\n' +
    'FROM [publicdata:samples.shakespeare];';

  bigquery.query(query, function(err, rows) {
    if (err) {
      return callback(err);
    }

    printExample(rows);
    callback(null, rows);
  });
}
// [END query]

// [END complete]

// Run the examples
exports.main = function (cb) {
  queryExample(cb);
};

if (module === require.main) {
  exports.main(
    console.log
  );
}
