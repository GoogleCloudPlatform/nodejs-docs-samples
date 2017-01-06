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

require(`../../system-test/_setup`);

const path = require(`path`);
const dns = require(`@google-cloud/dns`)();
const uuid = require(`uuid`);

const zoneName = `test-${uuid().substr(0, 13)}`;
const cwd = path.join(__dirname, `..`);
const cmd = `node zones.js`;

test.before(async () => {
  await dns.createZone(zoneName, {
    dnsName: `${process.env.GCLOUD_PROJECT}.appspot.com.`
  });
});

test.after.always(async () => {
  try {
    await dns.zone(zoneName).delete();
  } catch (err) {} // ignore error
});

test.beforeEach(stubConsole);
test.afterEach.always(restoreConsole);

test.cb(`should list zones`, (t) => {
  // Listing is eventually consistent, give the indexes time to update
  setTimeout(() => {
    runAsync(`${cmd} list`, cwd)
      .then((output) => {
        t.true(output.includes(`Zones:`));
        t.true(output.includes(zoneName));
        t.end();
      }).catch(t.end);
  }, 5000);
});
