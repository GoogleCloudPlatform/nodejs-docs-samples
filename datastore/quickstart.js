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

// [START datastore_quickstart]
// Imports the Google Cloud client library
const Datastore = require('@google-cloud/datastore');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const datastoreClient = Datastore({
  projectId: projectId
});

// The kind of the entity to retrieve
const kind = 'Task';
// The id of the entity to retrieve
const id = 1234567890;
// The Datastore key for the entity
const taskKey = datastoreClient.key([kind, id]);

// Retrieves the entity
datastoreClient.get(taskKey, (err, entity) => {
  if (!err) {
    // The entity was retrieved successfully
  }
});
// [END datastore_quickstart]
