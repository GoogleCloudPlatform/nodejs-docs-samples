// Copyright 2022 Google Inc. All Rights Reserved.
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

async function main() {
  // Imports the Google Cloud client library.
  const {UserEventServiceClient} = require('@google-cloud/retail').v2;
  const utils = require('../setup/setup-cleanup');

  // Instantiates a client.
  const retailClient = new UserEventServiceClient();

  const projectId = await retailClient.getProjectId();
  const visitorId = 'test_visitor_id';

  // Placement
  const parent = `projects/${projectId}/locations/global/catalogs/default_catalog`; // TO CHECK ERROR HANDLING PASTE THE INVALID CATALOG NAME HERE

  // User event to write
  const userEvent = {
    eventType: 'home-page-view',
    visitorId,
    eventTime: {
      seconds: Math.round(Date.now() / 1000),
    },
  };

  const callWriteUserEvent = async () => {
    // Construct request
    const request = {
      userEvent,
      parent,
    };

    console.log('Write request: ', request);

    // Run request
    const response = await retailClient.writeUserEvent(request);
    console.log(`Operation result: ${JSON.stringify(response[0])}`);
  };

  // Create new user event
  console.log('Start to write user event');
  await callWriteUserEvent();
  console.log('Write operation finished');

  // Purge user events by visitor id
  await utils.purgeUserEvents(parent, visitorId);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();
