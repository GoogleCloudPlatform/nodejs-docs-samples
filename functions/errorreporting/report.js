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

var Logging = require('@google-cloud/logging');

// Instantiate a logging client
var logging = Logging();

// [START helloHttpError]
/**
 * Report an error to StackDriver Error Reporting. Writes up to the maximum data
 * accepted by StackDriver Error Reporting.
 *
 * @param {Error} err The Error object to report.
 * @param {Object} [req] Request context, if any.
 * @param {Object} [res] Response context, if any.
 * @param {Object} [options] Additional context, if any.
 * @param {Function} callback Callback function.
 */
function reportDetailedError (err, req, res, options, callback) {
  if (typeof req === 'function') {
    callback = req;
    req = null;
    res = null;
    options = {};
  } else if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options || (options = {});

  var FUNCTION_NAME = process.env.FUNCTION_NAME;
  var log = logging.log('errors');

  // MonitoredResource
  // See https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
  var resource = {
    // MonitoredResource.type
    type: 'cloud_function',
    // MonitoredResource.labels
    labels: {
      function_name: FUNCTION_NAME
    }
  };
  if (typeof options.region === 'string') {
    resource.labels.region = options.region;
  }
  if (typeof options.projectId === 'string') {
    resource.labels.projectId = options.projectId;
  }

  var context = {};
  if (typeof options.user === 'string') {
    // ErrorEvent.context.user
    context.user = options.user;
  }
  if (req && res) {
    // ErrorEvent.context.httpRequest
    context.httpRequest = {
      method: req.method,
      url: req.originalUrl,
      userAgent: typeof req.get === 'function' ? req.get('user-agent') : 'unknown',
      referrer: '',
      remoteIp: req.ip
    };
    if (typeof res.statusCode === 'number') {
      context.httpRequest.responseStatusCode = res.statusCode;
    }
  }
  if (!(err instanceof Error) || typeof err.stack !== 'string') {
    // ErrorEvent.context.reportLocation
    context.reportLocation = {
      filePath: typeof options.filePath === 'string' ? options.filePath : 'unknown',
      lineNumber: typeof options.lineNumber === 'number' ? options.lineNumber : 0,
      functionName: typeof options.functionName === 'string' ? options.functionName : 'unknown'
    };
  }

  try {
    if (options.version === undefined) {
      var pkg = require('./package.json');
      options.version = pkg.version;
    }
  } catch (err) {}
  if (options.version === undefined) {
    options.version = 'unknown';
  }

  // ErrorEvent
  // See https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  var structPayload = {
    // ErrorEvent.serviceContext
    serviceContext: {
      // ErrorEvent.serviceContext.service
      service: 'cloud_function:' + FUNCTION_NAME,
      // ErrorEvent.serviceContext.version
      version: '' + options.version
    },
    // ErrorEvent.context
    context: context
  };

  // ErrorEvent.message
  if (err instanceof Error && typeof err.stack === 'string') {
    structPayload.message = err.stack;
  } else if (typeof err === 'string') {
    structPayload.message = err;
  } else if (typeof err.message === 'string') {
    structPayload.message = err.message;
  }

  log.write(log.entry(resource, structPayload), callback);
}
// [END helloHttpError]

module.exports = reportDetailedError;
