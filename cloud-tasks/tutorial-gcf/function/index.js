// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START cloud_tasks_func]
const escapeHtml = require('escape-html');
const {OAuth2Client} = require('google-auth-library');
const sendgrid = require('@sendgrid/mail');

const authClient = new OAuth2Client();
const EMAIL_REGEX = /^[^\s@<>",;]+@[^\s@<>",;.]+(?:\.[^\s@<>",;.]+)+$/;

/**
 * Responds to an HTTP request from Cloud Tasks and sends an email using data
 * from the request body.
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request payload.
 * @param {string} req.body.to_email Email address of the recipient.
 * @param {string} req.body.to_name Name of the recipient.
 * @param {string} req.body.from_name Name of the sender.
 * @param {object} res Cloud Function response context.
 */
exports.sendEmail = async (req, res) => {
  // Verify the OIDC bearer token attached by Cloud Tasks.
  const authHeader = (req.headers && req.headers.authorization) || '';
  const match = /^Bearer\s+(\S+)$/i.exec(authHeader);
  if (
    !match ||
    !process.env.FUNCTION_URL ||
    !process.env.SERVICE_ACCOUNT_EMAIL
  ) {
    res.status(401).send('Unauthorized.');
    return;
  }
  try {
    const ticket = await authClient.verifyIdToken({
      idToken: match[1],
      audience: process.env.FUNCTION_URL,
    });
    const payload = ticket.getPayload();
    if (
      !payload ||
      !payload.email_verified ||
      payload.email !== process.env.SERVICE_ACCOUNT_EMAIL
    ) {
      res.status(403).send('Forbidden.');
      return;
    }
  } catch (err) {
    console.error('OIDC token verification failed:', err);
    res.status(401).send('Unauthorized.');
    return;
  }

  // Get the SendGrid API key from the environment variable.
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    const error = new Error(
      'SENDGRID_API_KEY was not provided as environment variable.'
    );
    error.code = 401;
    throw error;
  }
  sendgrid.setApiKey(key);

  // Get the body from the Cloud Task request.
  const {to_email, to_name, from_name} = req.body || {};
  if (!to_email) {
    const error = new Error('Email address not provided.');
    error.code = 400;
    throw error;
  } else if (!to_name) {
    const error = new Error('Recipient name not provided.');
    error.code = 400;
    throw error;
  } else if (!from_name) {
    const error = new Error('Sender name not provided.');
    error.code = 400;
    throw error;
  } else if (
    typeof to_email !== 'string' ||
    to_email.length > 254 ||
    !EMAIL_REGEX.test(to_email)
  ) {
    const error = new Error('Invalid email address.');
    error.code = 400;
    throw error;
  }

  // Restrict recipients to an allowlist to prevent open mail relay.
  const allowedRecipients = (process.env.ALLOWED_RECIPIENT_EMAILS || '')
    .split(',')
    .map(addr => addr.trim().toLowerCase())
    .filter(Boolean);
  if (
    allowedRecipients.length === 0 ||
    !allowedRecipients.includes(to_email.trim().toLowerCase())
  ) {
    res.status(403).send('Recipient email address is not allowed.');
    return;
  }

  // Construct the email request.
  const msg = {
    to: to_email,
    from: 'postcard@example.com',
    subject: 'A Postcard Just for You!',
    html: postcardHTML(to_name, from_name),
  };

  try {
    await sendgrid.send(msg);
    // Send OK to Cloud Task queue to delete task.
    res.status(200).send('Postcard Sent!');
  } catch (error) {
    console.error(error);
    // Any status code other than 2xx or 503 will trigger the task to retry.
    res.status(500).send('Unable to send email.');
  }
};
// [END cloud_tasks_func]

// Function creates an HTML postcard with message.
const postcardHTML = function (to_name, from_name) {
  return `<html>
  <head>
    <style>
      .postcard {
        width: 600px;
        height: 400px;
        background: #4285F4;
        text-align: center;
      }

      .postcard-text {
        font-family: Arial, sans-serif;
        font-size: 60px;
        font-weight: bold;
        text-transform: uppercase;
        color: #FFF;
        padding: 40px 0px;
      }

      .postcard-names {
        font-family: Monaco, monospace;
        font-size: 30px;
        text-align: left;
        color: #FFF;
        margin: 15px;
        padding-top: 5px;
        overflow: hidden;
        white-space: nowrap;
      }

      .postcard-footer {
        font-family: Monaco, monospace;
        font-size: 14px;
        color: #FFF;
        padding-top: 50px;
      }
    </style>
  </head>
  <body>
    <div class="postcard">
      <div class="postcard-names">
        To: ${escapeHtml(to_name)}
        <br>
        From: ${escapeHtml(from_name)}
      </div>
      <div class="postcard-text">
          Hello,<br>World!
      </div>
      <div class="postcard-footer">
        powered by Google
      </div>
      </div>
  </body>
</html>`;
};
