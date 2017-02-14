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

require(`../../system-test/_setup`);

const proxyquire = require(`proxyquire`).noPreserveCache();

test.before(stubConsole);
test.after.always(restoreConsole);

test.cb(`should query a table`, (t) => {
  const databaseMock = {
    run: (_query) => {
      t.deepEqual(_query, {
        sql: `SELECT 1`
      });
      setTimeout(() => {
        try {
          t.deepEqual(console.log.getCall(0).args, [`test`]);
          t.end();
        } catch (err) {
          t.end(err);
        }
      }, 200);
      return Promise.resolve([['test']]);
    }
  };
  const instanceMock = {
    database: sinon.stub().returns(databaseMock)
  };
  const spannerMock = {
    instance: sinon.stub().returns(instanceMock)
  };

  proxyquire(`../quickstart`, {
    '@google-cloud/spanner': sinon.stub().returns(spannerMock)
  });

  t.deepEqual(spannerMock.instance.getCall(0).args, [`my-instance`]);
  t.deepEqual(instanceMock.database.getCall(0).args, [`my-database`]);
});
