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

// [START functions_sendgrid_setup]
const Buffer = require('safe-buffer').Buffer;
const sendgrid = require('sendgrid');
const config = require('./config.json');
const uuid = require('uuid');

// Get a reference to the Cloud Storage component
const storage = require('@google-cloud/storage')();
// Get a reference to the BigQuery component
const bigquery = require('@google-cloud/bigquery')();
// [END functions_sendgrid_setup]

// [START functions_sendgrid_get_client]
/**
 * Returns a configured SendGrid client.
 *
 * @param {string} key Your SendGrid API key.
 * @returns {object} SendGrid client.
 */
function getClient (key) {
  if (!key) {
    const error = new Error('SendGrid API key not provided. Make sure you have a "sg_key" property in your request querystring');
    error.code = 401;
    throw error;
  }

  // Using SendGrid's Node.js Library https://github.com/sendgrid/sendgrid-nodejs
  return sendgrid(key);
}
// [END functions_sendgrid_get_client]

// [START functions_get_payload]
/**
 * Constructs the SendGrid email request from the HTTP request body.
 *
 * @param {object} requestBody Cloud Function request body.
 * @param {string} data.to Email address of the recipient.
 * @param {string} data.from Email address of the sender.
 * @param {string} data.subject Email subject line.
 * @param {string} data.body Body of the email subject line.
 * @returns {object} Payload object.
 */
function getPayload (requestBody) {
  if (!requestBody.to) {
    const error = new Error('To email address not provided. Make sure you have a "to" property in your request');
    error.code = 400;
    throw error;
  } else if (!requestBody.from) {
    const error = new Error('From email address not provided. Make sure you have a "from" property in your request');
    error.code = 400;
    throw error;
  } else if (!requestBody.subject) {
    const error = new Error('Email subject line not provided. Make sure you have a "subject" property in your request');
    error.code = 400;
    throw error;
  } else if (!requestBody.body) {
    const error = new Error('Email content not provided. Make sure you have a "body" property in your request');
    error.code = 400;
    throw error;
  }

  return {
    personalizations: [
      {
        to: [
          {
            email: requestBody.to
          }
        ],
        subject: requestBody.subject
      }
    ],
    from: {
      email: requestBody.from
    },
    content: [
      {
        type: 'text/plain',
        value: requestBody.body
      }
    ]
  };
}
// [END functions_get_payload]

// [START functions_sendgrid_email]
/**
 * Send an email using SendGrid.
 *
 * Trigger this function by making a POST request with a payload to:
 * https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/sendEmail?sg_key=[YOUR_API_KEY]
 *
 * @example
 * curl -X POST "https://us-central1.your-project-id.cloudfunctions.net/sendEmail?sg_key=your_api_key" --data '{"to":"bob@email.com","from":"alice@email.com","subject":"Hello from Sendgrid!","body":"Hello World!"}' --header "Content-Type: application/json"
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.query The parsed querystring.
 * @param {string} req.query.sg_key Your SendGrid API key.
 * @param {object} req.body The request payload.
 * @param {string} req.body.to Email address of the recipient.
 * @param {string} req.body.from Email address of the sender.
 * @param {string} req.body.subject Email subject line.
 * @param {string} req.body.body Body of the email subject line.
 * @param {object} res Cloud Function response context.
 */
exports.sendgridEmail = (req, res) => {
  return Promise.resolve()
    .then(() => {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }

      // Get a SendGrid client
      const client = getClient(req.query.sg_key);

      // Build the SendGrid request to send email
      const request = client.emptyRequest({
        method: 'POST',
        path: '/v3/mail/send',
        body: getPayload(req.body)
      });

      // Make the request to SendGrid's API
      console.log(`Sending email to: ${req.body.to}`);
      return client.API(request);
    })
    .then((response) => {
      if (response.statusCode < 200 || response.statusCode >= 400) {
        const error = Error(response.body);
        error.code = response.statusCode;
        throw error;
      }

      console.log(`Email sent to: ${req.body.to}`);

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
    })
    .catch((err) => {
      console.error(err);
      const code = err.code || (err.response ? err.response.statusCode : 500) || 500;
      res.status(code).send(err);
      return Promise.reject(err);
    });
};
// [END functions_sendgrid_email]

// [START functions_sendgrid_verify_webhook]
/**
 * Verify that the webhook request came from sendgrid.
 *
 * @param {string} authorization The authorization header of the request, e.g. "Basic ZmdvOhJhcg=="
 */
function verifyWebhook (authorization) {
  const basicAuth = Buffer.from(authorization.replace('Basic ', ''), 'base64').toString();
  const parts = basicAuth.split(':');
  if (parts[0] !== config.USERNAME || parts[1] !== config.PASSWORD) {
    const error = new Error('Invalid credentials');
    error.code = 401;
    throw error;
  }
}
// [END functions_sendgrid_verify_webhook]

// [START functions_sendgrid_fix_names]
/**
 * Recursively rename properties in to meet BigQuery field name requirements.
 *
 * @param {*} obj Value to examine.
 */
function fixNames (obj) {
  if (Array.isArray(obj)) {
    obj.forEach(fixNames);
  } else if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      const value = obj[key];
      fixNames(value);
      const fixedKey = key.replace('-', '_');
      if (fixedKey !== key) {
        obj[fixedKey] = value;
        delete obj[key];
      }
    });
  }
}
// [END functions_sendgrid_fix_names]

// [START functions_sendgrid_webhook]
/**
 * Receive a webhook from SendGrid.
 *
 * See https://sendgrid.com/docs/API_Reference/Webhooks/event.html
 *
 * @param {object} req Cloud Function request context.
 * @param {object} res Cloud Function response context.
 */
exports.sendgridWebhook = (req, res) => {
  return Promise.resolve()
    .then(() => {
      if (req.method !== 'POST') {
        const error = new Error('Only POST requests are accepted');
        error.code = 405;
        throw error;
      }

      verifyWebhook(req.get('authorization') || '');

      const events = req.body || [];

      // Make sure property names in the data meet BigQuery standards
      fixNames(events);

      // Generate newline-delimited JSON
      // See https://cloud.google.com/bigquery/data-formats#json_format
      const json = events.map((event) => JSON.stringify(event)).join('\n');

      // Upload a new file to Cloud Storage if we have events to save
      if (json.length) {
        const bucketName = config.EVENT_BUCKET;
        const unixTimestamp = new Date().getTime() * 1000;
        const filename = `${unixTimestamp}-${uuid.v4()}.json`;
        const file = storage.bucket(bucketName).file(filename);

        console.log(`Saving events to ${filename} in bucket ${bucketName}`);

        return file.save(json).then(() => {
          console.log(`JSON written to ${filename}`);
        });
      }
    })
    .then(() => res.status(200).end())
    .catch((err) => {
      console.error(err);
      res.status(err.code || 500).send(err);
      return Promise.reject(err);
    });
};
// [END functions_sendgrid_webhook]

// [START functions_sendgrid_get_table]
/**
 * Helper method to get a handle on a BigQuery table. Automatically creates the
 * dataset and table if necessary.
 */
function getTable () {
  const dataset = bigquery.dataset(config.DATASET);

  return dataset.get({ autoCreate: true })
    .then(([dataset]) => dataset.table(config.TABLE).get({ autoCreate: true }));
}
// [END functions_sendgrid_get_table]

// [START functions_sendgrid_load]
/**
 * Cloud Function triggered by Cloud Storage when a file is uploaded.
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data A Cloud Storage file object.
 * @param {string} event.data.bucket Name of the Cloud Storage bucket.
 * @param {string} event.data.name Name of the file.
 * @param {string} [event.data.timeDeleted] Time the file was deleted if this is a deletion event.
 * @see https://cloud.google.com/storage/docs/json_api/v1/objects#resource
 */
exports.sendgridLoad = (event) => {
  const file = event.data;

  if (file.resourceState === 'not_exists') {
    // This was a deletion event, we don't want to process this
    return;
  }

  return Promise.resolve()
    .then(() => {
      if (!file.bucket) {
        throw new Error('Bucket not provided. Make sure you have a "bucket" property in your request');
      } else if (!file.name) {
        throw new Error('Filename not provided. Make sure you have a "name" property in your request');
      }

      return getTable();
    })
    .then(([table]) => {
      const fileObj = storage.bucket(file.bucket).file(file.name);
      console.log(`Starting job for ${file.name}`);
      const metadata = {
        autodetect: true,
        sourceFormat: 'NEWLINE_DELIMITED_JSON'
      };
      return table.import(fileObj, metadata);
    })
    .then(([job]) => job.promise())
    .then(() => console.log(`Job complete for ${file.name}`))
    .catch((err) => {
      console.log(`Job failed for ${file.name}`);
      return Promise.reject(err);
    });
};
// [END functions_sendgrid_load]
