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

const Logging = require('@google-cloud/logging');

// Instantiates a client
const logging = Logging();

// [START functions_errorreporting_report_advanced]
/**
 * Report an error to StackDriver Error Reporting. Writes up to the maximum data
 * accepted by StackDriver Error Reporting.
 *
 * @param {Error} err The Error object to report.
 * @param {object} [req] Request context, if any.
 * @param {object} [res] Response context, if any.
 * @param {object} [options] Additional context, if any.
 * @param {function} callback Callback function.
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

  const FUNCTION_NAME = process.env.FUNCTION_NAME;
  const log = logging.log('errors');

  const metadata = {
    // MonitoredResource
    // See https://cloud.google.com/logging/docs/api/ref_v2beta1/rest/v2beta1/MonitoredResource
    resource: {
      // MonitoredResource.type
      type: 'cloud_function',
      // MonitoredResource.labels
      labels: {
        function_name: FUNCTION_NAME
      }
    }
  };

  if (typeof options.region === 'string') {
    metadata.resource.labels.region = options.region;
  }
  if (typeof options.projectId === 'string') {
    metadata.resource.labels.projectId = options.projectId;
  }

  const context = {};
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
      const pkg = require('./package.json');
      options.version = pkg.version;
    }
  } catch (err) {}
  if (options.version === undefined) {
    options.version = 'unknown';
  }

  // ErrorEvent
  // See https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  const structPayload = {
    // ErrorEvent.serviceContext
    serviceContext: {
      // ErrorEvent.serviceContext.service
      service: `cloud_function:${FUNCTION_NAME}`,
      // ErrorEvent.serviceContext.version
      version: `${options.version}`
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

  log.write(log.entry(metadata, structPayload), callback);
}
// [END functions_errorreporting_report_advanced]

module.exports = reportDetailedError;
