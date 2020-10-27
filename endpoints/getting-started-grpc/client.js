// Copyright 2017 Google LLC
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

// [START endpoints_make_grpc_request]
const makeGrpcRequest = (JWT_AUTH_TOKEN, API_KEY, HOST, GREETEE) => {
  // Uncomment these lines to set their values
  // const JWT_AUTH_TOKEN = 'YOUR_JWT_AUTH_TOKEN';
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
  if (API_KEY) {
    metadata.add('x-api-key', API_KEY);
  } else if (JWT_AUTH_TOKEN) {
    metadata.add('authorization', `Bearer ${JWT_AUTH_TOKEN}`);
  }

  // Execute gRPC request
  client.sayHello({name: GREETEE}, metadata, (err, response) => {
    if (err) {
      console.error(err);
    }

    if (response) {
      console.log(response.message);
    }
  });
};
// [END endpoints_make_grpc_request]

// The command-line program
const {argv} = require('yargs')
  .usage(
    'Usage: node $0 {-k YOUR_API_KEY>, <-j YOUR_JWT_AUTH_TOKEN} [-h YOUR_ENDPOINTS_HOST] [-g GREETEE_NAME]'
  )
  .option('jwtAuthToken', {
    alias: 'j',
    type: 'string',
    global: true,
    default: '',
  })
  .option('apiKey', {
    alias: 'k',
    type: 'string',
    global: true,
    default: '',
  })
  .option('host', {
    alias: 'h',
    type: 'string',
    default: 'localhost:50051',
    global: true,
  })
  .option('greetee', {
    alias: 'g',
    type: 'string',
    default: 'world',
    global: true,
  })
  .check(argv => {
    const valid = !!(argv.jwtAuthToken || argv.apiKey);
    if (!valid) {
      console.error('One of API_KEY or JWT_AUTH_TOKEN must be set.');
    }
    return valid;
  })
  .wrap(120)
  .help()
  .strict()
  .epilogue(
    'For more information, see https://cloud.google.com/endpoints/docs'
  );

makeGrpcRequest(argv.jwtAuthToken, argv.apiKey, argv.host, argv.greetee);
