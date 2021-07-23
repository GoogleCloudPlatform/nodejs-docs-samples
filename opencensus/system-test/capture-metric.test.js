// Copyright 2021 Google LLC
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

const {Spanner} = require('@google-cloud/spanner');
const assert = require('assert');
const cp = require('child_process');
const {describe, it, before} = require('mocha');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const CURRENT_TIME = Math.round(Date.now() / 1000).toString();
const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const PREFIX = 'test-instance';
const INSTANCE_ID =
  process.env.SPANNERTEST_INSTANCE || `${PREFIX}-${CURRENT_TIME}`;
const DATABASE_ID = `test-database-${CURRENT_TIME}`;
const LOCATION_ID = 'regional-us-central1';

before(() => {
  assert(
    process.env.GOOGLE_CLOUD_PROJECT,
    'Must set GOOGLE_CLOUD_PROJECT environment variable!'
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!'
  );
});

const spanner = new Spanner({
  projectId: PROJECT_ID,
});

describe('captureMetric', () => {
  const instance = spanner.instance(INSTANCE_ID);

  before(async () => {
    const [, operation] = await instance.create({
      config: LOCATION_ID,
      nodes: 1,
    });

    await operation.promise();

    const request = {
      schema: [
        `CREATE TABLE Albums (
                  SingerId    INT64 NOT NULL,
                  AlbumId     INT64 NOT NULL,
                  AlbumTitle  STRING(MAX)
                ) PRIMARY KEY (SingerId, AlbumId)`,
      ],
    };

    // Creates a database
    const [database, operation1] = await instance.createDatabase(
      DATABASE_ID,
      request
    );

    await operation1.promise();

    const albumsTable = database.table('Albums');

    await albumsTable.insert([
      {SingerId: '1', AlbumId: '1', AlbumTitle: 'Total Junk'},
    ]);
  });

  // grpc-metric
  it('should capture the grpc metric after running query', async () => {
    const output = execSync(
      `node capture-metric.js ${INSTANCE_ID} ${DATABASE_ID} ${PROJECT_ID}`
    );
    assert.match(output, /SingerId: 1, AlbumId: 1, AlbumTitle: Total Junk/);
  });
});
