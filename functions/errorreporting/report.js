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

var gcloud = require('gcloud');
var logging = gcloud.logging();

function getVersion (options) {
  try {
    if (options.version === undefined) {
      var pkg = require('./package.json');
      options.version = pkg.version;
    }
  } catch (err) {}
  if (options.version === undefined) {
    options.version = 'unknown';
  }
}

function getRequest (options) {
  if (options.req && options.req) {
    var req = options.req;
    return {
      method: req.method,
      url: req.originalUrl,
      userAgent: typeof req.get === 'function' ? req.get('user-agent') : 'unknown',
      referrer: '',
      responseStatusCode: options.res.statusCode,
      remoteIp: req.ip
    };
  }
}

function report (options, callback) {
  options || (options = {});
  options.err || (options.err = {});
  options.req || (options.req = {});

  var FUNCTION_NAME = process.env.FUNCTION_NAME;
  var FUNCTION_TRIGGER_TYPE = process.env.FUNCTION_TRIGGER_TYPE;
  var ENTRY_POINT = process.env.ENTRY_POINT;

  getVersion(options);

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

  // ErrorEvent
  // See https://cloud.google.com/error-reporting/reference/rest/v1beta1/ErrorEvent
  var context = {};
  if (typeof options.user === 'string') {
    // ErrorEvent.context.user
    context.user = options.user;
  }
  if (FUNCTION_TRIGGER_TYPE === 'HTTP_TRIGGER') {
    // ErrorEvent.context.httpRequest
    context.httpRequest = getRequest(options);
  }
  if (!(options.err instanceof Error)) {
    // ErrorEvent.context.reportLocation
    context.reportLocation = {
      filePath: typeof options.filePath === 'string' ? options.filePath : 'unknown',
      lineNumber: typeof options.lineNumber === 'number' ? options.lineNumber : 0,
      functionName: ENTRY_POINT
    };
  }

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
  if (options.err instanceof Error && typeof options.err.stack === 'string') {
    structPayload.message = options.err.stack;
  } else if (typeof options.err === 'string') {
    structPayload.message = options.err;
  } else if (typeof options.err.message === 'string') {
    structPayload.message = options.err.message;
  }

  log.write(log.entry(resource, structPayload), callback);
}

exports.report = report;

exports.reportError = function reportError (err, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options.err = err;
  report(options, callback);
};

exports.reportHttpError = function reportHttpError (err, req, res, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  options.err = err;
  options.req = req;
  options.res = res;
  report(options, callback);
};
