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
var async = require('async');
var sendgrid = require('sendgrid');
var config = require('./config.json');
var gcloud = require('google-cloud');
var uuid = require('node-uuid');

// Get a reference to the Cloud Storage component
var storage = gcloud.storage();
// Get a reference to the BigQuery component
var bigquery = gcloud.bigquery();
// [END setup]

// [START getClient]
/**
 * Returns a configured SendGrid client.
 *
 * @param {string} key Your SendGrid API key.
 * @returns {Object} SendGrid client.
 */
function getClient (key) {
  if (!key) {
    var error = new Error('SendGrid API key not provided. Make sure you have a ' +
      '"sg_key" property in your request querystring');
    error.code = 401;
    throw error;
  }

  // Using SendGrid's Node.js Library https://github.com/sendgrid/sendgrid-nodejs
  return sendgrid.SendGrid(key);
}
// [END getClient]

// [START getPayload]
/**
 * Constructs the SendGrid email request from the HTTP request body.
 *
 * @param {Object} requestBody Cloud Function request body.
 * @param {string} data.to Email address of the recipient.
 * @param {string} data.from Email address of the sender.
 * @param {string} data.subject Email subject line.
 * @param {string} data.body Body of the email subject line.
 * @returns {Object} Payload object.
 */
function getPayload (requestBody) {
  if (!requestBody.to) {
    var error = new Error('To email address not provided. Make sure you have a ' +
      '"to" property in your request');
    error.code = 400;
    throw error;
  }

  if (!requestBody.from) {
    error = new Error('From email address not provided. Make sure you have a ' +
      '"from" property in your request');
    error.code = 400;
    throw error;
  }

  if (!requestBody.subject) {
    error = new Error('Email subject line not provided. Make sure you have a ' +
      '"subject" property in your request');
    error.code = 400;
    throw error;
  }

  if (!requestBody.body) {
    error = new Error('Email content not provided. Make sure you have a ' +
      '"body" property in your request');
    error.code = 400;
    throw error;
  }

  return new sendgrid.mail.Mail(
    new sendgrid.mail.Email(requestBody.from),
    requestBody.subject,
    new sendgrid.mail.Email(requestBody.to),
    new sendgrid.mail.Content('text/plain', requestBody.body)
  );
}
// [END getPayload]

// [START email]
/**
 * Send an email using SendGrid.
 *
 * Trigger this function by making a POST request with a payload to:
 * https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/sendEmail?sg_key=[YOUR_API_KEY]
 *
 * @example
 * curl -X POST "https://us-central1.your-project-id.cloudfunctions.net/sendEmail?sg_key=your_api_key" --data '{"to":"bob@email.com","from":"alice@email.com","subject":"Hello from Sendgrid!","body":"Hello World!"}' --header "Content-Type: application/json"
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} req.query The parsed querystring.
 * @param {string} req.query.sg_key Your SendGrid API key.
 * @param {Object} req.body The request payload.
 * @param {string} req.body.to Email address of the recipient.
 * @param {string} req.body.from Email address of the sender.
 * @param {string} req.body.subject Email subject line.
 * @param {string} req.body.body Body of the email subject line.
 * @param {Object} res Cloud Function response context.
 */
exports.sendgridEmail = function sendgridEmail (req, res) {
  try {
    if (req.method !== 'POST') {
      var error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    // Get a SendGrid client
    var client = getClient(req.query.sg_key);

    // Build the SendGrid request to send email
    var request = client.emptyRequest();
    request.method = 'POST';
    request.path = '/v3/mail/send';
    request.body = getPayload(req.body).toJSON();

    // Make the request to SendGrid's API
    console.log('Sending email to: ' + req.body.to);
    client.API(request, function (response) {
      if (response.statusCode < 200 || response.statusCode >= 400) {
        console.error(response);
      } else {
        console.log('Email sent to: ' + req.body.to);
      }

      // Forward the response back to the requester
      res.status(response.statusCode);
      if (response.headers['content-type']) {
        res.set('content-type', response.headers['content-type']);
      }
      if (response.headers['content-length']) {
        res.set('content-length', response.headers['content-length']);
      }
      if (response.body) {
        res.send(response.body);
      } else {
        res.end();
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(err.code || 500).send(err.message);
  }
};
// [END email]

// [START verifyWebhook]
/**
 * Verify that the webhook request came from sendgrid.
 *
 * @param {string} authorization The authorization header of the request, e.g. "Basic ZmdvOhJhcg=="
 */
function verifyWebhook (authorization) {
  var basicAuth = new Buffer(authorization.replace('Basic ', ''), 'base64').toString();
  var parts = basicAuth.split(':');
  if (parts[0] !== config.USERNAME || parts[1] !== config.PASSWORD) {
    var error = new Error('Invalid credentials');
    error.code = 401;
    throw error;
  }
}
// [END verifyWebhook]

// [START fixNames]
/**
 * Recursively rename properties in to meet BigQuery field name requirements.
 *
 * @param {*} obj Value to examine.
 */
function fixNames (obj) {
  if (Array.isArray(obj)) {
    obj.forEach(fixNames);
  } else if (obj && typeof obj === 'object') {
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        var value = obj[key];
        fixNames(value);
        var fixedKey = key.replace('-', '_');
        if (fixedKey !== key) {
          obj[fixedKey] = value;
          delete obj[key];
        }
      }
    }
  }
}
// [END fixNames]

// [START webhook]
/**
 * Receive a webhook from SendGrid.
 *
 * See https://sendgrid.com/docs/API_Reference/Webhooks/event.html
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.sendgridWebhook = function sendgridWebhook (req, res) {
  try {
    if (req.method !== 'POST') {
      var error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    verifyWebhook(req.get('authorization') || '');

    var events = req.body || [];

    // Make sure property names in the data meet BigQuery standards
    fixNames(events);

    // Generate newline-delimited JSON
    // See https://cloud.google.com/bigquery/data-formats#json_format
    var json = events.map(function (event) {
      return JSON.stringify(event);
    }).join('\n');

    // Upload a new file to Cloud Storage if we have events to save
    if (json.length) {
      var bucketName = config.EVENT_BUCKET;
      var unixTimestamp = new Date().getTime() * 1000;
      var filename = '' + unixTimestamp + '-' + uuid.v4() + '.json';
      var file = storage.bucket(bucketName).file(filename);

      console.log('Saving events to ' + filename + ' in bucket ' + bucketName);

      return file.save(json, function (err) {
        if (err) {
          console.error(err);
          return res.status(500).end();
        }
        console.log('JSON written to ' + filename);
        return res.status(200).end();
      });
    }

    return res.status(200).end();
  } catch (err) {
    console.error(err);
    return res.status(err.code || 500).send(err.message);
  }
};
// [END webhook]

// [START getTable]
/**
 * Helper method to get a handle on a BigQuery table. Automatically creates the
 * dataset and table if necessary.
 *
 * @param {Function} callback Callback function.
 */
function getTable (callback) {
  var dataset = bigquery.dataset(config.DATASET);
  return dataset.get({
    autoCreate: true
  }, function (err, dataset) {
    if (err) {
      return callback(err);
    }
    var table = dataset.table(config.TABLE);
    return table.get({
      autoCreate: true
    }, function (err, table) {
      if (err) {
        return callback(err);
      }
      return callback(null, table);
    });
  });
}
// [END getTable]

// [START load]
/**
 * Cloud Function triggered by Cloud Storage when a file is uploaded.
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by Cloud Storage.
 * @param {string} data.bucket Name of the Cloud Storage bucket.
 * @param {string} data.name Name of the file.
 * @param {string} [data.timeDeleted] Time the file was deleted if this is a deletion event.
 * @see https://cloud.google.com/storage/docs/json_api/v1/objects#resource
 */
exports.sendgridLoad = function sendgridLoad (context, data) {
  try {
    if (data.hasOwnProperty('timeDeleted')) {
      // This was a deletion event, we don't want to process this
      return context.done();
    }

    if (!data.bucket) {
      throw new Error('Bucket not provided. Make sure you have a ' +
        '"bucket" property in your request');
    }
    if (!data.name) {
      throw new Error('Filename not provided. Make sure you have a ' +
        '"name" property in your request');
    }

    return async.waterfall([
      // Get a handle on the table
      function (callback) {
        getTable(callback);
      },
      // Start the load job
      function (table, callback) {
        console.log('Starting job for ' + data.name);

        var file = storage.bucket(data.bucket).file(data.name);
        var metadata = {
          autodetect: true,
          sourceFormat: 'NEWLINE_DELIMITED_JSON'
        };
        table.import(file, metadata, callback);
      },
      // Here we wait for the job to finish (or fail) in order to log the
      // job result, but one could just exit without waiting.
      function (job, apiResponse, callback) {
        job.on('complete', function () {
          console.log('Job complete for ' + data.name);
          callback();
        });
        job.on('error', function (err) {
          console.error('Job failed for ' + data.name);
          callback(err);
        });
      }
    ], function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }
      return context.success();
    });
  } catch (err) {
    console.error(err);
    return context.failure(err.message);
  }
};
// [END load]
