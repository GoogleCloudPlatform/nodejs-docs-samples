// Copyright 2017, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

function makeGrpcRequest (API_KEY, HOST, GREETEE) {
  // Uncomment these lines to set their values
  // const API_KEY = 'YOUR_API_KEY';
  // const HOST = 'localhost:50051'; // The IP address of your endpoints host
  // const GREETEE = 'world';

  // Import required libraries
  const grpc = require('grpc');
  const path = require('path');

  // Load protobuf spec for an example API
  const PROTO_PATH = path.join(__dirname, '/protos/helloworld.proto');
  const protoObj = grpc.load(PROTO_PATH).helloworld;

  // Create a client for the protobuf spec
  const client = new protoObj.Greeter(HOST, grpc.credentials.createInsecure());

  // Build gRPC request
  const metadata = new grpc.Metadata();
  metadata.add('x-api-key', API_KEY);

  // Execute gRPC request
  client.sayHello({ name: GREETEE }, metadata, (err, response) => {
    if (err) {
      console.error(err);
    }

    if (response) {
      console.log(response.message);
    }
  });
}

// The command-line program
const argv = require('yargs')
  .usage('Usage: node $0 -k YOUR_API_KEY [-h YOUR_ENDPOINTS_HOST] [-g GREETEE_NAME]')
  .option('apiKey', {
    alias: 'k',
    type: 'string',
    global: true,
    default: ''
  })
  .option('host', {
    alias: 'h',
    type: 'string',
    default: 'localhost:50051',
    global: true
  })
  .option('greetee', {
    alias: 'g',
    type: 'string',
    default: 'world',
    global: true
  })
  .wrap(120)
  .epilogue(`For more information, see https://cloud.google.com/endpoints/docs`)
  .argv;

makeGrpcRequest(argv.apiKey, argv.host, argv.greetee);
