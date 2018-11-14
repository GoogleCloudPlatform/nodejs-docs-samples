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

const test = require('ava');

var sampleTests = [
  {
    dir: 'appengine/grunt',
    deploy: true,
    cmd: 'node',
    args: ['./src/bin/www'],
    msg: 'Hello World! Express.js + Grunt.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '0.12',
  },
  // Investigate flaky test
  // {
  //   dir: 'appengine/loopback',
  //   cmd: 'node',
  //   args: ['server/server.js'],
  //   msg: 'started',
  //   code: 304
  // },
  {
    dir: 'appengine/memcached',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Value:',
    test: /Value: \d\.\d+/,
  },
  {
    dir: 'appengine/mongodb',
    cmd: 'node',
    args: ['server.js'],
    msg: 'IPs:',
    TRAVIS: true,
  },
  {
    dir: 'appengine/pubsub',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Messages received by this instance:',
    env: {
      PUBSUB_TOPIC: 'test',
      PUBSUB_VERIFICATION_TOKEN: 'foo',
    },
  },
  {
    dir: 'appengine/redis',
    cmd: 'node',
    args: ['server.js'],
    msg: '127.0.0.1',
  },
  {
    dir: 'appengine/sendgrid',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Express.js + Sendgrid on Google App Engine.',
  },
  {
    dir: 'appengine/static-files',
    cmd: 'node',
    args: ['app.js'],
    msg: 'This is a static file serving example.',
  },
  {
    dir: 'appengine/storage/flexible',
    cmd: 'node',
    args: ['app.js'],
    msg: '<title>Static Files</title>',
    env: {
      GCLOUD_STORAGE_BUCKET: 'nodejs-docs-samples',
    },
  },
  {
    dir: 'appengine/storage/standard',
    cmd: 'node',
    args: ['app.js'],
    msg: '<title>Static Files</title>',
    env: {
      GCLOUD_STORAGE_BUCKET: 'nodejs-docs-samples',
    },
  },
  {
    dir: 'appengine/parse-server',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello, world!',
    TRAVIS_NODE_VERSION: '6',
    env: {
      APP_ID: 'foo',
      MASTER_KEY: 'bar',
      SERVER_URL: 'http://localhost:',
    },
  },
];

test(t => {
  t.truthy(sampleTests);
});
