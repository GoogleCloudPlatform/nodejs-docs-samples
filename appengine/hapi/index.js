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

// [START server]
const Hapi = require('hapi');

// Create a server with a host and port
const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: process.env.PORT || 8080
});
// [END server]

// [START index]
server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('Hello World! Hapi.js on Google App Engine.');
  }
});
// [END index]

// Add another route
server.route({
  method: 'GET',
  path: '/hello',
  handler: (request, reply) => {
    reply('Hello World! Hapi.js on Google App Engine.');
  }
});

// [START server_start]
server.start(() => {
  console.log(`Server running at: ${server.info.uri}`);
});
// [END server_start]
