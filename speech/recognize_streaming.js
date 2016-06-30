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

// [START proto]
var PROTO_ROOT_DIR = googleProtoFiles('..');
var PROTO_FILE_PATH = googleProtoFiles('cloud', 'speech', 'v1', 'cloud_speech.proto');

var protoDescriptor = grpc.load({
  root: PROTO_ROOT_DIR,
  file: path.relative(PROTO_ROOT_DIR, PROTO_FILE_PATH)
}, 'proto', {
  binaryAsBase64: true,
  convertFieldsToCamelCase: true
});
var speechProto = protoDescriptor.google.cloud.speech.v1;
// [END proto]

// [START authenticating]
function getSpeechService (callback) {
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
    var stub = new speechProto.Speech('speech.googleapis.com', credentials);
    return callback(null, stub);
  });
}
// [END authenticating]

// [START construct_request]
function getAudioFile (inputFile, callback) {
  fs.readFile(inputFile, function (err, audioFile) {
    if (err) {
      return callback(err);
    }
    console.log('Got audio file!');
    return callback(null, audioFile);
  });
}
// [END construct_request]

function main (inputFile, callback) {
  var audioFile;

  async.waterfall([
    function (cb) {
      getAudioFile(inputFile, cb);
    },
    function (_audioFile, cb) {
      audioFile = _audioFile;
      getSpeechService(cb);
    },
    // [START send_request]
    function sendRequest (speechService, cb) {
      console.log('Analyzing speech...');
      var responses = [];
      var call = speechService.recognize();

      // Listen for various responses
      call.on('error', cb);
      call.on('data', function (recognizeResponse) {
        if (recognizeResponse) {
          responses.push(recognizeResponse);
        }
      });
      call.on('end', function () {
        cb(null, responses);
      });

      // Write the initial recognize reqeust
      call.write(new speechProto.RecognizeRequest({
        initialRequest: new speechProto.InitialRecognizeRequest({
          encoding: 'LINEAR16',
          sampleRate: 16000,
          interimResults: false,
          continuous: false,
          enableEndpointerEvents: false
        })
      }));

      // Write an audio request
      call.write(new speechProto.RecognizeRequest({
        audioRequest: new speechProto.AudioRequest({
          content: audioFile
        })
      }));

      // Signal that we're done writing
      call.end();
    }
    // [END send_request]
  ], callback);
}

// [START run_application]
if (module === require.main) {
  if (process.argv.length < 3) {
    console.log('Usage: node recognize_streaming <inputFile>');
    process.exit();
  }
  var inputFile = process.argv[2];
  main(inputFile, console.log);
}
// [END run_application]

exports.main = main;
