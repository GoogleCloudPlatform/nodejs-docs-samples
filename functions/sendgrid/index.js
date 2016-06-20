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

var SendGrid = require('sendgrid');

/**
 * Returns a configured SendGrid client.
 *
 * @param {Object} requestData Cloud Function request data.
 * @param {string} data.sg_key Your SendGrid API key.
 * @returns {Object} SendGrid client.
 */
function getClient (requestData) {
  if (!requestData.sg_key) {
    throw new Error('SendGrid API key not provided. Make sure you have a ' +
      '"sg_key" property in your request');
  }

  // Using SendGrid's Node.js Library https://github.com/sendgrid/sendgrid-nodejs
  return SendGrid(requestData.sg_key);
}

/**
 * Constructs the payload object from the request data.
 *
 * @param {Object} requestData Cloud Function request data.
 * @param {string} data.to Email address of the recipient.
 * @param {string} data.from Email address of the sender.
 * @param {string} data.subject Email subject line.
 * @param {string} data.body Body of the email subject line.
 * @returns {Object} Payload object.
 */
function getPayload (requestData) {
  if (!requestData.to) {
    throw new Error('To email address not provided. Make sure you have a ' +
      '"to" property in your request');
  }

  if (!requestData.from) {
    throw new Error('From email address not provided. Make sure you have a ' +
      '"from" property in your request');
  }

  if (!requestData.subject) {
    throw new Error('Email subject line not provided. Make sure you have a ' +
      '"subject" property in your request');
  }

  if (!requestData.body) {
    throw new Error('Email content not provided. Make sure you have a ' +
      '"body" property in your request');
  }

  return {
    to: requestData.to,
    from: requestData.from,
    subject: requestData.subject,
    text: requestData.body
  };
}

/**
 * Send an email using SendGrid.
 *
 * @example
 * gcloud alpha functions call sendEmail --data '{"sg_key":"[YOUR_SENDGRID_KEY]","to":"[YOUR_RECIPIENT_ADDR]","from":"[YOUR_SENDER_ADDR]","subject":"Hello from Sendgrid!","body":"Hello World!"}'
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the user.
 * @param {string} data.to Email address of the recipient.
 * @param {string} data.from Email address of the sender.
 * @param {string} data.sg_key Your SendGrid API key.
 * @param {string} data.subject Email subject line.
 * @param {string} data.body Body of the email subject line.
 */
exports.sendEmail = function sendEmail (context, data) {
  try {
    var client = getClient(data);
    var payload = getPayload(data);

    console.log('Sending email to: ' + payload.to);

    client.send(payload, function (err, json) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }
      return context.success(json);
    });
  } catch (err) {
    console.error(err);
    return context.failure(err.message);
  }
};
