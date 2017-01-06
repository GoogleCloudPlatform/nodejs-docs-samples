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

// [START dns_quickstart]
// Imports the Google Cloud client library
const DNS = require('@google-cloud/dns');

// Your Google Cloud Platform project ID
const projectId = 'YOUR_PROJECT_ID';

// Instantiates a client
const dnsClient = DNS({
  projectId: projectId
});

// Lists all zones in the current project
dnsClient.getZones()
  .then((results) => {
    const zones = results[0];

    console.log('Zones:');
    zones.forEach((zone) => console.log(zone.name));
  });
// [END dns_quickstart]
