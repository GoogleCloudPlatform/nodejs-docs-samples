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

// [START storage_quickstart]
// Imports the Google Cloud client library
const Storage = require('@google-cloud/storage');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const storageClient = Storage({
  projectId: projectId
});

// The name for the new bucket
const bucketName = 'my-new-bucket';

// Creates the new bucket
storageClient.createBucket(bucketName, (err, bucket) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`Bucket ${bucket.name} created.`);
});
// [END storage_quickstart]
