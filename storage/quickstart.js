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

// [START quickstart]
// Import and instantiate the Google Cloud client library
// for Google Cloud Storage
const storage = require('@google-cloud/storage')({
  projectId: 'YOUR_PROJECT_ID'
});

// Creates a new bucket
storage.createBucket('my-new-bucket', (err, bucket) => {
  if (!err) {
    // The bucket was created successfully
  }
});
// [END quickstart]
