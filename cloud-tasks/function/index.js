/**
 * Copyright 2019 Google LLC
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

/**
 * Responds to an HTTP request from Cloud Tasks and sends an email using data
 * from the request body.
 */
exports.sendPostcard = async (req, res) => {
  const sgMail = require('@sendgrid/mail');

  // Get the SendGrid API key from the environment variable.
  const key = process.env.SENDGRID_API_KEY;
  if (!key) {
    const error = new Error(
      'SendGrid API key not provided as environment variable.'
    );
    error.code = 401;
    throw error;
  }
  sgMail.setApiKey(key);

  // Get the body from the Cloud Task request.
  const postcardBody = req.body;
  if (!postcardBody.to_email) {
    const error = new Error('To email address not provided.');
    error.code = 400;
    throw error;
  } else if (!postcardBody.from_email) {
    const error = new Error('From email address not provided.');
    error.code = 400;
    throw error;
  } else if (!postcardBody.message) {
    const error = new Error('Email message not provided.');
    error.code = 400;
    throw error;
  }

  // Construct the email request.
  const msg = {
    to: postcardBody.to_email,
    from: postcardBody.from_email,
    subject: 'A Postcard Just for You!',
    html: postcardHTML(postcardBody.message),
  };

  try {
    await sgMail.send(msg);
    // Send OK to Cloud Task queue to delete task.
    res.status(200).send('Postcard Sent!');
  } catch(error) {
    // Any status code other than 2xx or 503 will trigger the task to retry.
    res.status(error.code).send(error.message);
  }
};

// Function creates an HTML postcard with message.
function postcardHTML(message) {
  const converted_message = message.replace(/\n/g, '<br>');
  return `<html>
  <head>
    <style>
    .card-wrapper {
      overflow: hidden;
      box-shadow: 0px 5px 30px rgba(0,0,0,0.25);
      border: 20px solid #ffffff;
      outline: 1px solid #000;
      width: 800px;
      height: 500px;
      background: linear-gradient(172deg, #FFE3EF 50%, #6dd5ed 100%);
      margin: 10px;
    }
    .greeting {
      margin: 10px 0 0 20px;
      font-size: 36px;
      font-family: 'Courier', monospace;
      color: #222222;
    }
    </style>
  </head>
  <body>
    <div class="card-wrapper">
      <div class="greeting">
        ${converted_message}
      </div>
    </div>
  </body>
  </html>`;
}
