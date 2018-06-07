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

// [START functions_errorreporting_setup]
const Logging = require('@google-cloud/logging');

// Instantiates a client
const logging = Logging();
// [END functions_errorreporting_setup]

const reportDetailedError = require('./report');

// [START functions_errorreporting_report]
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
  const logName = 'errors';
  const log = logging.log(logName);

  const metadata = {
    // https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
    resource: {
      type: 'cloud_function',
      labels: {
        function_name: process.env.FUNCTION_NAME
      }
    }
  };

  // https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const errorEvent = {
    message: err.stack,
    serviceContext: {
      service: `cloud_function:${process.env.FUNCTION_NAME}`,
      version: require('./package.json').version || 'unknown'
    }
  };

  // Write the error log entry
  log.write(log.entry(metadata, errorEvent), callback);
}
// [END functions_errorreporting_report]

// [START functions_errorreporting_simple]
/**
 * HTTP Cloud Function.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.helloSimpleError = (req, res) => {
  try {
    if (req.method !== 'GET') {
      const error = new Error('Only GET requests are accepted!');
      error.code = 405;
      throw error;
    }
    // All is good, respond to the HTTP request
    res.send('Hello World!');
  } catch (err) {
    // Report the error
    reportError(err, () => {
      // Now respond to the HTTP request
      res.status(err.code || 500).send(err.message);
    });
  }
};
// [END functions_errorreporting_simple]

// [START functions_errorreporting_http]
/**
 * HTTP Cloud Function.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.message Message provided in the request.
 * @param {object} res Cloud Function response context.
 */
exports.helloHttpError = (req, res) => {
  try {
    if (req.method !== 'POST' && req.method !== 'GET') {
      const error = new Error('Only POST and GET requests are accepted!');
      error.code = 405;
      throw error;
    }
    // All is good, respond to the HTTP request
    res.send(`Hello ${req.body.message || 'World'}!`);
  } catch (err) {
    // Set the response status code before reporting the error
    res.status(err.code || 500);
    // Report the error
    reportDetailedError(err, req, res, () => {
      // Now respond to the HTTP request
      res.send(err);
    });
  }
};
// [END functions_errorreporting_http]

// [START functions_errorreporting_background]
/**
 * Background Cloud Function.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data The event data.
 * @param {string} event.data.message Message, provided by the trigger.
 * @param {function} callback The callback function.
 */
exports.helloBackgroundError = (event, callback) => {
  try {
    if (!event.data.message) {
      throw new Error('"message" is required!');
    }

    // Do something

    // Done, respond with a success message
    callback(null, 'Done!');
  } catch (err) {
    // Report the error
    reportDetailedError(err, () => {
      // Now finish and mark the execution as a failure
      callback(err);
    });
  }
};
// [END functions_errorreporting_background]
