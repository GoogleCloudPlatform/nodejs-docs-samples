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

const path = require(`path`);
const assert = require('assert');
const tools = require(`@google-cloud/nodejs-repo-tools`);

describe(`Text Detection`, () => {
  before(async () => {
    tools.checkCredentials;
  });

  it(`should detect texts`, done => {
    const redis = require('redis');
    const client = redis.createClient();

    client
      .on('error', err => {
        if (err && err.code === 'ECONNREFUSED') {
          console.error(
            'Redis is unavailable. Skipping vision textDetection test.'
          );
          client.end(true);
          done();
        } else {
          client.end(true);
          done(err);
        }
      })
      .on('ready', async () => {
        const inputDir = path.join(__dirname, `../resources`);
        const textDetectionSample = require(`../textDetection`);

        const textResponse = await textDetectionSample
          .main(inputDir)
          .catch(err => {
            console.log(`Error at 46: ${err}`);
          });
        assert.ok(Object.keys(textResponse).length > 0);

        const hits = await textDetectionSample
          .lookup(['the', 'sunbeams', 'in'])
          .catch(err => {
            console.log(`Error at 51: ${err}`);
          });
        assert.ok(hits.length > 0);
        assert.ok(hits.length > 0);
        assert.ok(hits[0].length > 0);
      });
  });
});
