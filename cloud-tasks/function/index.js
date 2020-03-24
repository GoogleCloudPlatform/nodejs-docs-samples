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
const sendgrid = require('@sendgrid/mail');

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
  const {to_email, to_name, from_name} = req.body;
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
    // Any status code other than 2xx or 503 will trigger the task to retry.
    res.status(error.code).send(error.message);
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
        To: ${to_name}
        <br>
        From: ${from_name}
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
