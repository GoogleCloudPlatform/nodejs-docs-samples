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

const fs = require('fs');

async function main() {
  const updateEventsTimestamp = filePath => {
    const events = fs.readFileSync(filePath).toString().split('\n');
    const changedEvents = [];

    for (let i = 0; i < events.length - 1; ++i) {
      const event = JSON.parse(`[${events[i]}]`)[0];
      const date = new Date(event.eventTime);
      date.setDate(date.getDate() - 1);
      event.eventTime = date.toISOString();
      changedEvents.push(JSON.stringify(event));
    }

    const stream = fs.createWriteStream(filePath);
    stream.on('error', error => {
      throw error;
    });
    changedEvents.forEach(item => {
      stream.write(item + '\n');
    });
    stream.close();
  };

  updateEventsTimestamp('resources/user_events.json');
  updateEventsTimestamp('resources/user_events_some_invalid.json');
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
