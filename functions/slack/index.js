// Copyright 2016 Google LLC
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

// [START functions_slack_setup]
const functions = require('@google-cloud/functions-framework');
const google = require('@googleapis/kgsearch');
const {verifyRequestSignature} = require('@slack/events-api');

// Get a reference to the Knowledge Graph Search component
const kgsearch = google.kgsearch('v1');
// [END functions_slack_setup]

// [START functions_slack_format]
/**
 * Format the Knowledge Graph API response into a richly formatted Slack message.
 *
 * @param {string} query The user's search query.
 * @param {object} response The response from the Knowledge Graph API.
 * @returns {object} The formatted message.
 */
const formatSlackMessage = (query, response) => {
  let entity;

  // Extract the first entity from the result list, if any
  if (
    response &&
    response.data &&
    response.data.itemListElement &&
    response.data.itemListElement.length > 0
  ) {
    entity = response.data.itemListElement[0].result;
  }

  // Prepare a rich Slack message
  // See https://api.slack.com/docs/message-formatting
  const slackMessage = {
    response_type: 'in_channel',
    text: `Query: ${query}`,
    attachments: [],
  };

  if (entity) {
    const attachment = {
      color: '#3367d6',
    };
    if (entity.name) {
      attachment.title = entity.name;
      if (entity.description) {
        attachment.title = `${attachment.title}: ${entity.description}`;
      }
    }
    if (entity.detailedDescription) {
      if (entity.detailedDescription.url) {
        attachment.title_link = entity.detailedDescription.url;
      }
      if (entity.detailedDescription.articleBody) {
        attachment.text = entity.detailedDescription.articleBody;
      }
    }
    if (entity.image && entity.image.contentUrl) {
      attachment.image_url = entity.image.contentUrl;
    }
    slackMessage.attachments.push(attachment);
  } else {
    slackMessage.attachments.push({
      text: 'No results match your query...',
    });
  }

  return slackMessage;
};
// [END functions_slack_format]

// [START functions_verify_webhook]
/**
 * Verify that the webhook request came from Slack.
 *
 * @param {object} req Cloud Function request object.
 * @param {string} req.headers Headers Slack SDK uses to authenticate request.
 * @param {string} req.rawBody Raw body of webhook request to check signature against.
 */
const verifyWebhook = req => {
  const signature = {
    signingSecret: process.env.SLACK_SECRET,
    requestSignature: req.headers['x-slack-signature'],
    requestTimestamp: req.headers['x-slack-request-timestamp'],
    body: req.rawBody,
  };

  // This method throws an exception if an incoming request is invalid.
  verifyRequestSignature(signature);
};
// [END functions_verify_webhook]

// [START functions_slack_request]
/**
 * Send the user's search query to the Knowledge Graph API.
 *
 * @param {string} query The user's search query.
 */
const makeSearchRequest = query => {
  return new Promise((resolve, reject) => {
    kgsearch.entities.search(
      {
        auth: process.env.KG_API_KEY,
        query: query,
        limit: 1,
      },
      (err, response) => {
        console.log(err);
        if (err) {
          reject(err);
          return;
        }

        // Return a formatted message
        resolve(formatSlackMessage(query, response));
      }
    );
  });
};
// [END functions_slack_request]

// [START functions_slack_search]
/**
 * Receive a Slash Command request from Slack.
 *
 * Trigger this function by creating a Slack slash command with the HTTP Trigger URL.
 * You can find the HTTP URL in the Cloud Console or using `gcloud functions describe`
 *
 * @param {object} req Cloud Function request object.
 * @param {object} req.body The request payload.
 * @param {string} req.rawBody Raw request payload used to validate Slack's message signature.
 * @param {string} req.body.text The user's search query.
 * @param {object} res Cloud Function response object.
 */
functions.http('kgSearch', async (req, res) => {
  try {
    if (req.method !== 'POST') {
      const error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    if (!req.body.text) {
      const error = new Error('No text found in body.');
      error.code = 400;
      throw error;
    }

    // Verify that this request came from Slack
    verifyWebhook(req);

    // Make the request to the Knowledge Graph Search API
    const response = await makeSearchRequest(req.body.text);

    // Send the formatted message back to Slack
    res.json(response);

    return Promise.resolve();
  } catch (err) {
    console.error(err);
    res.status(err.code || 500).send(err);
    return Promise.reject(err);
  }
});
// [END functions_slack_search]
