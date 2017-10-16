/*
 * Copyright 2017, Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * EDITING INSTRUCTIONS
 * This file was generated from the file
 * https://github.com/googleapis/googleapis/blob/master/google/cloud/texttospeech/v1beta1/cloud_tts.proto,
 * and updates to that file get reflected here through a refresh process.
 * For the short term, the refresh process will only be runnable by Google
 * engineers.
 *
 * The only allowed edits are to method and file documentation. A 3-way
 * merge preserves those additions if the generated source changes.
 */
/* TODO: introduce line-wrapping so that it never exceeds the limit. */
/* jscs: disable maximumLineLength */
'use strict';

var configData = require('./text_to_speech_client_config');
var extend = require('extend');
var gax = require('google-gax');
var googleProtoFiles = require('google-proto-files');
var path = require('path');
var protobuf = require('protobufjs');

var SERVICE_ADDRESS = 'texttospeech.googleapis.com';

var DEFAULT_SERVICE_PORT = 443;

var CODE_GEN_NAME_VERSION = 'gapic/0.0.5';

/**
 * The scopes needed to make gRPC calls to all of the methods defined in
 * this service.
 */
var ALL_SCOPES = [
  'https://www.googleapis.com/auth/cloud-platform'
];

/**
 * Service that implements Google Cloud Text-to-Speech API.
 *
 *
 * @class
 */
function TextToSpeechClient(gaxGrpc, loadedProtos, opts) {
  opts = extend({
    servicePath: SERVICE_ADDRESS,
    port: DEFAULT_SERVICE_PORT,
    clientConfig: {}
  }, opts);

  var googleApiClient = [
    'gl-node/' + process.versions.node
  ];
  if (opts.libName && opts.libVersion) {
    googleApiClient.push(opts.libName + '/' + opts.libVersion);
  }
  googleApiClient.push(
    CODE_GEN_NAME_VERSION,
    'gax/' + gax.version,
    'grpc/' + gaxGrpc.grpcVersion
  );

  var defaults = gaxGrpc.constructSettings(
      'google.cloud.texttospeech.v1beta1.TextToSpeech',
      configData,
      opts.clientConfig,
      {'x-goog-api-client': googleApiClient.join(' ')});

  var self = this;

  this.auth = gaxGrpc.auth;
  var textToSpeechStub = gaxGrpc.createStub(
      loadedProtos.google.cloud.texttospeech.v1beta1.TextToSpeech,
      opts);
  var textToSpeechStubMethods = [
    'listVoices',
    'synthesizeSpeech'
  ];
  textToSpeechStubMethods.forEach(function(methodName) {
    self['_' + methodName] = gax.createApiCall(
      textToSpeechStub.then(function(textToSpeechStub) {
        return function() {
          var args = Array.prototype.slice.call(arguments, 0);
          return textToSpeechStub[methodName].apply(textToSpeechStub, args);
        };
      }),
      defaults[methodName],
      null);
  });
}


/**
 * Get the project ID used by this class.
 * @param {function(Error, string)} callback - the callback to be called with
 *   the current project Id.
 */
TextToSpeechClient.prototype.getProjectId = function(callback) {
  return this.auth.getProjectId(callback);
};

// Service calls

/**
 * Returns a list of {@link Voice}
 * supported for synthesis.
 *
 * @param {Object} request
 *   The request object that will be sent.
 * @param {string=} request.filter
 *   Optional filter applied to search results.
 *   e.g. 'language_codes:"en-us"' will return the voices supported for
 *   American English; 'language_codes:"es-*" AND gender=MALE' will return
 *   the male voices supported for Spanish.
 * @param {Object=} options
 *   Optional parameters. You can override the default settings for this call, e.g, timeout,
 *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
 * @param {function(?Error, ?Object)=} callback
 *   The function which will be called with the result of the API call.
 *
 *   The second parameter to the callback is an object representing [ListVoicesResponse]{@link ListVoicesResponse}.
 * @return {Promise} - The promise which resolves to an array.
 *   The first element of the array is an object representing [ListVoicesResponse]{@link ListVoicesResponse}.
 *   The promise has a method named "cancel" which cancels the ongoing API call.
 *
 * @example
 *
 * var texttospeech = require('texttospeech.v1beta1');
 *
 * var client = texttospeech.v1beta1({
 *   // optional auth parameters.
 * });
 *
 *
 * client.listVoices({}).then(function(responses) {
 *     var response = responses[0];
 *     // doThingsWith(response)
 * })
 * .catch(function(err) {
 *     console.error(err);
 * });
 */
TextToSpeechClient.prototype.listVoices = function(request, options, callback) {
  if (options instanceof Function && callback === undefined) {
    callback = options;
    options = {};
  }
  if (options === undefined) {
    options = {};
  }

  return this._listVoices(request, options, callback);
};

/**
 * Synthesizes speech synchronously: receive results after all text input
 * has been processed.
 *
 * @param {Object} request
 *   The request object that will be sent.
 * @param {Object} request.input
 *   Required. The Synthesizer requires either plain text or SSML as input.
 *
 *   This object should have the same structure as [SynthesisInput]{@link SynthesisInput}
 * @param {Object} request.voice
 *   Required. The desired voice of the synthesized audio.
 *
 *   This object should have the same structure as [VoiceSelectionParams]{@link VoiceSelectionParams}
 * @param {Object} request.audioConfig
 *   Required. The configuration of the synthesized audio.
 *
 *   This object should have the same structure as [AudioConfig]{@link AudioConfig}
 * @param {Object=} options
 *   Optional parameters. You can override the default settings for this call, e.g, timeout,
 *   retries, paginations, etc. See [gax.CallOptions]{@link https://googleapis.github.io/gax-nodejs/global.html#CallOptions} for the details.
 * @param {function(?Error, ?Object)=} callback
 *   The function which will be called with the result of the API call.
 *
 *   The second parameter to the callback is an object representing [SynthesizeSpeechResponse]{@link SynthesizeSpeechResponse}.
 * @return {Promise} - The promise which resolves to an array.
 *   The first element of the array is an object representing [SynthesizeSpeechResponse]{@link SynthesizeSpeechResponse}.
 *   The promise has a method named "cancel" which cancels the ongoing API call.
 *
 * @example
 *
 * var texttospeech = require('texttospeech.v1beta1');
 *
 * var client = texttospeech.v1beta1({
 *   // optional auth parameters.
 * });
 *
 * var input = {};
 * var voice = {};
 * var audioConfig = {};
 * var request = {
 *     input: input,
 *     voice: voice,
 *     audioConfig: audioConfig
 * };
 * client.synthesizeSpeech(request).then(function(responses) {
 *     var response = responses[0];
 *     // doThingsWith(response)
 * })
 * .catch(function(err) {
 *     console.error(err);
 * });
 */
TextToSpeechClient.prototype.synthesizeSpeech = function(request, options, callback) {
  if (options instanceof Function && callback === undefined) {
    callback = options;
    options = {};
  }
  if (options === undefined) {
    options = {};
  }

  return this._synthesizeSpeech(request, options, callback);
};

function TextToSpeechClientBuilder(gaxGrpc) {
  if (!(this instanceof TextToSpeechClientBuilder)) {
    return new TextToSpeechClientBuilder(gaxGrpc);
  }

  var textToSpeechStubProtos = gaxGrpc.loadProto(
    path.join(__dirname, '..', '..', 'protos'), 'google/cloud/texttospeech/v1beta1/cloud_tts.proto');
  extend(this, textToSpeechStubProtos.google.cloud.texttospeech.v1beta1);


  /**
   * Build a new instance of {@link TextToSpeechClient}.
   *
   * @param {Object=} opts - The optional parameters.
   * @param {String=} opts.servicePath
   *   The domain name of the API remote host.
   * @param {number=} opts.port
   *   The port on which to connect to the remote host.
   * @param {grpc.ClientCredentials=} opts.sslCreds
   *   A ClientCredentials for use with an SSL-enabled channel.
   * @param {Object=} opts.clientConfig
   *   The customized config to build the call settings. See
   *   {@link gax.constructSettings} for the format.
   */
  this.textToSpeechClient = function(opts) {
    return new TextToSpeechClient(gaxGrpc, textToSpeechStubProtos, opts);
  };
  extend(this.textToSpeechClient, TextToSpeechClient);
}
module.exports = TextToSpeechClientBuilder;
module.exports.SERVICE_ADDRESS = SERVICE_ADDRESS;
module.exports.ALL_SCOPES = ALL_SCOPES;