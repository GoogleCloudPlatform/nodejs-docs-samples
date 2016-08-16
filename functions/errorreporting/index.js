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

// [START setup]
var Logging = require('@google-cloud/logging');

// Instantiate a logging client
var logging = Logging();
// [END setup]

// [START reportDetailedError]
var reportDetailedError = require('./report');
// [END reportDetailedError]

// [START helloSimpleErrorReport]
/**
 * Report an error to StackDriver Error Reporting. Writes the minimum data
 * required for the error to be picked up by StackDriver Error Reporting.
 *
 * @param {Error} err The Error object to report.
 * @param {Function} callback Callback function.
 */
function reportError (err, callback) {
  // This is the name of the StackDriver log stream that will receive the log
  // entry. This name can be any valid log stream name, but must contain "err"
  // in order for the error to be picked up by StackDriver Error Reporting.
  var logName = 'errors';
  var log = logging.log(logName);

  // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  var monitoredResource = {
    type: 'cloud_function',
    labels: {
      function_name: process.env.FUNCTION_NAME
    }
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  var errorEvent = {
    message: err.stack,
    serviceContext: {
      service: 'cloud_function:' + process.env.FUNCTION_NAME,
      version: require('./package.json').version || 'unknown'
    }
  };

  // Write the error log entry
  log.write(log.entry(monitoredResource, errorEvent), callback);
}
// [END helloSimpleErrorReport]

// [START helloSimpleError]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request object.
 * @param {Object} res Cloud Function response object.
 */
exports.helloSimpleError = function helloSimpleError (req, res) {
  try {
    if (req.method !== 'GET') {
      var error = new Error('Only GET requests are accepted!');
      error.code = 405;
      throw error;
    }
    // All is good, respond to the HTTP request
    return res.send('Hello World!');
  } catch (err) {
    // Report the error
    return reportError(err, function () {
      // Now respond to the HTTP request
      return res.status(error.code || 500).send(err.message);
    });
  }
};
// [END helloSimpleError]

// [START helloHttpError]
/**
 * HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request object.
 * @param {Object} res Cloud Function response object.
 */
exports.helloHttpError = function helloHttpError (req, res) {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      var error = new Error('Only POST and GET requests are accepted!');
      error.code = 405;
      throw error;
    }
    // All is good, respond to the HTTP request
    return res.send('Hello ' + (req.body.message || 'World') + '!');
  } catch (err) {
    // Set the response status code before reporting the error
    res.status(err.code || 500);
    // Report the error
    return reportDetailedError(err, req, res, function () {
      // Now respond to the HTTP request
      return res.send(err.message);
    });
  }
};
// [END helloHttpError]

// [START helloBackgroundError]
/**
 * Background Cloud Function.
 *
 * @param {Object} context Cloud Function context object.
 * @param {Object} data Request data, provided by a trigger.
 * @param {string} data.message Message, provided by the trigger.
 */
exports.helloBackgroundError = function helloBackgroundError (context, data) {
  try {
    if (!data.message) {
      throw new Error('"message" is required!');
    }
    // All is good, respond with a message
    return context.success('Hello World!');
  } catch (err) {
    // Report the error
    return reportDetailedError(err, function () {
      // Now finish mark the execution failure
      return context.failure(err.message);
    });
  }
};
// [END helloBackgroundError]
