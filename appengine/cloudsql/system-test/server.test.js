// Copyright 2017, Google, Inc.
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

const mysqlTestConfig = require(`./_mysql-test-config`);
const postgresTestConfig = require(`./_postgres-test-config`);

const async = require(`async`);
const childProcess = require(`child_process`);
const test = require(`ava`);
const utils = require(`@google-cloud/nodejs-repo-tools`);

test.serial.cb(`should load using MySQL`, (t) => {
  const proxy = childProcess.exec(
    `cloud_sql_proxy -instances="${mysqlTestConfig.env.INSTANCE_CONNECTION_NAME}"=tcp:3306`,
    { env: mysqlTestConfig.env }
  );

  async.series([
    (cb) => {
      setTimeout(cb, 2500); // Give the proxy time to start
    },
    (cb) => {
      utils.getRequest(mysqlTestConfig)
        .get(`/`)
        .expect(200)
        .expect((response) => {
          t.regex(response.text, /Time: \w+ \w+ \d{2} \d{4}/);
        })
        .end(cb);
    },
    (cb) => {
      proxy.on('exit', () => {
        cb();
      });
      proxy.kill('SIGINT');
    },
    (cb) => {
      t.end();
      cb();
    }
  ]);
});

test.serial.cb(`should load using Postgres`, (t) => {
  const proxy = childProcess.exec(
    `cloud_sql_proxy -instances="${postgresTestConfig.env.INSTANCE_CONNECTION_NAME}"=tcp:5432`,
    { env: postgresTestConfig.env }
  );
  async.series([
    (cb) => {
      setTimeout(cb, 2500); // Give the proxy time to start
    },
    (cb) => {
      utils.getRequest(postgresTestConfig)
        .get(`/`)
        .expect(200)
        .expect((response) => {
          t.regex(response.text, /Time: \w+ \w+ \d{2} \d{4}/);
        })
        .end(cb);
    },
    (cb) => {
      proxy.on('exit', () => {
        cb();
      });
      proxy.kill('SIGINT');
    },
    (cb) => {
      t.end();
      cb();
    }
  ]);
});
