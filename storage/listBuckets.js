// Copyright 2015-2016, Google, Inc.
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

// [START setup]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var gcloud = require('gcloud');

// Get a reference to the storage component
var storage = gcloud.storage();
// [END setup]

// [START listBuckets]
/**
 * Fetches a list of the buckets under the given project id.
 *
 * @param {string} projectId The project id that owns the buckets.
 * @param {function} cb The callback function.
 */
function listBucketsExample (projectId, callback) {
  var options = {
    maxResults: 5
  };

  storage.getBuckets(options, function (err, buckets, nextQuery, apiResponse) {
    if (err) {
      return callback(err);
    }

    console.log('Found ' + buckets.length + ' buckets!');
    console.log(nextQuery ? 'More pages available.' : 'No more pages.');
    return callback(null, buckets);
  });
}
// [END listBuckets]

// Run the samples
function main (projectId, cb) {
  listBucketsExample(projectId, cb);
}

exports.main = main;

if (module === require.main) {
  var projectId = process.argv.slice(2).shift();
  if (!projectId) {
    console.log('Usage: node listBuckets [PROJECT_ID]');
  } else {
    main(projectId, console.log);
  }
}
