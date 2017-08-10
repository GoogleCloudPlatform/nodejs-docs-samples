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

const path = require(`path`);

const GCLOUD_PROJECT = process.env.GCLOUD_PROJECT;
const GCLOUD_REGION = `us-central1`;
const SQL_INSTANCE_BASE_NAME = `integration-tests-instance`;

module.exports = {
  cmd: `server`,
  cwd: path.resolve(path.join(__dirname, `../`)),

  // This dictionary should override process.env
  env: Object.assign({}, process.env, {
    INSTANCE_CONNECTION_NAME: `${GCLOUD_PROJECT}:${GCLOUD_REGION}:${SQL_INSTANCE_BASE_NAME}-psql`,
    SQL_CLIENT: `pg`,
    SQL_USER: process.env.POSTGRES_USER,
    SQL_PASSWORD: process.env.POSTGRES_PASSWORD,
    SQL_DATABASE: 'appengine_cloudsql',
    PORT: 8082
  })
};
