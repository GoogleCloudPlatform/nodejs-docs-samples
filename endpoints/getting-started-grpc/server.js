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

const path = require('path');
const PROTO_PATH = path.join(__dirname, '/protos/helloworld.proto');

const grpc = require('grpc');
const helloProto = grpc.load(PROTO_PATH).helloworld;

// Implement the SayHello RPC method.
function sayHello(call, callback) {
  callback(null, {message: `Hello ${call.request.name}`});
}

// Start an RPC server to handle Greeter service requests
function startServer(PORT) {
  const server = new grpc.Server();
  server.addProtoService(helloProto.Greeter.service, {sayHello: sayHello});
  server.bind(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure());
  server.start();
}

// The command-line program
const argv = require('yargs')
  .usage('Usage: node $0 [-p PORT]')
  .option('port', {
    alias: 'p',
    type: 'number',
    default: 50051,
    global: true,
  })
  .wrap(120)
  .epilogue(`For more information, see https://cloud.google.com/endpoints/docs`)
  .argv;

startServer(argv.port);
