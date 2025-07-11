// Copyright 2022 Google Inc.
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
// [START retail_rejoin_user_events]

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

  const UserEventRejoinScope = {
    USER_EVENT_REJOIN_SCOPE_UNSPECIFIED: 0,
    JOINED_EVENTS: 1,
    UNJOINED_EVENTS: 2,
  };
  // The type of the user event rejoin to define the scope and range of the user
  // events to be rejoined with the latest product catalog
  const userEventRejoinScope = UserEventRejoinScope.UNJOINED_EVENTS;

  const callRejoinUserEvents = async () => {
    // Construct request
    const request = {
      parent,
      userEventRejoinScope,
    };

    console.log('Rejoin request: ', request);

    // Run request
    const [operation] = await retailClient.rejoinUserEvents(request);
    console.log(
      `Rejoin operation in progress.. Operation name: ${operation.name}`
    );
  };

  // Create new event
  const event = await utils.writeUserEvent(visitorId);
  console.log(
    `Created event ${event.eventType} with visitor id ${event.visitorId}`
  );

  // Rejoin events
  await callRejoinUserEvents();

  // Purge events
  utils.purgeUserEvents(parent, visitorId);
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main();

// [END retail_rejoin_user_events]
