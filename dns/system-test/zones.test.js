/**
 * Copyright 2017, Google, Inc.
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

const dns = require(`@google-cloud/dns`)();
const path = require(`path`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const uuid = require(`uuid`);

const zoneName = `test-${uuid().substr(0, 13)}`;
const cwd = path.join(__dirname, `..`);
const cmd = `node zones.js`;

test.before(tools.checkCredentials);
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

test(`should list zones`, async (t) => {
  t.plan(0);
  await tools.tryTest(async (assert) => {
    const output = await tools.runAsync(`${cmd} list`, cwd);
    assert(output.includes(`Zones:`));
    assert(output.includes(zoneName));
  }).start();
});
