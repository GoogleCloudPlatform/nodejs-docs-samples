// Copyright 2016, Google, Inc.
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

var async = require('async');
var fs = require('fs');
var path = require('path');
var grpc = require('grpc');
var googleProtoFiles = require('google-proto-files');
var googleAuth = require('google-auto-auth');
var Transform = require('stream').Transform;

// [START proto]
var PROTO_ROOT_DIR = googleProtoFiles('..');

var protoDescriptor = grpc.load({
  root: PROTO_ROOT_DIR,
  file: path.relative(PROTO_ROOT_DIR, googleProtoFiles.speech.v1beta1)
}, 'proto', {
  binaryAsBase64: true,
  convertFieldsToCamelCase: true
});
var speechProto = protoDescriptor.google.cloud.speech.v1beta1;
// [END proto]

// [START authenticating]
function getSpeechService (host, callback) {
  var googleAuthClient = googleAuth({
    scopes: [
      'https://www.googleapis.com/auth/cloud-platform'
    ]
  });

  googleAuthClient.getAuthClient(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    var credentials = grpc.credentials.combineChannelCredentials(
      grpc.credentials.createSsl(),
      grpc.credentials.createFromGoogleCredential(authClient)
    );

    console.log('Loading speech service...');
    var stub = new speechProto.Speech(host, credentials);
    return callback(null, stub);
  });
}
// [END authenticating]

function main (inputFile, host, callback) {
  async.waterfall([
    function (cb) {
      getSpeechService(host, cb);
    },
    // [START send_request]
    function sendRequest (speechService, cb) {
      console.log('Analyzing speech...');
      var responses = [];
      var call = speechService.streamingRecognize();

      // Listen for various responses
      call.on('error', cb);
      call.on('data', function (recognizeResponse) {
        if (recognizeResponse) {
          responses.push(recognizeResponse);
          if (recognizeResponse.results && recognizeResponse.results.length) {
            console.log(JSON.stringify(recognizeResponse.results, null, 2));
          }
        }
      });
      call.on('end', function () {
        cb(null, responses);
      });

      // Write the initial recognize reqeust
      call.write({
        streamingConfig: {
          config: {
            encoding: 'LINEAR16',
            sampleRate: 16000
          },
          interimResults: false,
          singleUtterance: false
        }
      });

      var toRecognizeRequest = new Transform({ objectMode: true });
      toRecognizeRequest._transform = function (chunk, encoding, done) {
        done(null, {
          audioContent: chunk
        });
      };

      // Stream the audio to the Speech API
      fs.createReadStream(inputFile)
        .pipe(toRecognizeRequest)
        .pipe(call);
    }
    // [END send_request]
  ], callback);
}

// [START run_application]
if (module === require.main) {
  if (process.argv.length < 3) {
    console.log('Usage: node recognize_streaming <inputFile> [speech_api_host]');
    process.exit();
  }
  var inputFile = process.argv[2];
  var host = process.argv[3];
  main(inputFile, host || 'speech.googleapis.com', console.log);
}
// [END run_application]

exports.main = main;
