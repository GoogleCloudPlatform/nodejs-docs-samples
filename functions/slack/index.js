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
var config = require('./config.json');
var googleapis = require('googleapis');

// Get a reference to the Knowledge Graph Search component
var kgsearch = googleapis.kgsearch('v1');
// [END setup]

// [START formatSlackMessage]
/**
 * Format the Knowledge Graph API response into a richly formatted Slack message.
 *
 * @param {string} query The user's search query.
 * @param {Object} response The response from the Knowledge Graph API.
 * @returns {Object} The formatted message.
 */
function formatSlackMessage (query, response) {
  var entity;

  // Extract the first entity from the result list, if any
  if (response && response.itemListElement &&
    response.itemListElement.length) {
    entity = response.itemListElement[0].result;
  }

  // Prepare a rich Slack message
  // See https://api.slack.com/docs/message-formatting
  var slackMessage = {
    response_type: 'in_channel',
    text: 'Query: ' + query,
    attachments: []
  };

  if (entity) {
    var attachment = {
      color: '#3367d6'
    };
    if (entity.name) {
      attachment.title = entity.name;
      if (entity.description) {
        attachment.title = attachment.title + ': ' + entity.description;
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
      text: 'No results match your query...'
    });
  }

  return slackMessage;
}
// [END formatSlackMessage]

// [START verifyWebhook]
/**
 * Verify that the webhook request came from Slack.
 *
 * @param {Object} body The body of the request.
 * @param {string} body.token The Slack token to be verified.
 */
function verifyWebhook (body) {
  if (!body || body.token !== config.SLACK_TOKEN) {
    var error = new Error('Invalid credentials');
    error.code = 401;
    throw error;
  }
}
// [END verifyWebhook]

// [START makeSearchRequest]
/**
 * Send the user's search query to the Knowledge Graph API.
 *
 * @param {string} query The user's search query.
 * @param {Function} callback Callback function.
 */
function makeSearchRequest (query, callback) {
  kgsearch.entities.search({
    auth: config.KG_API_KEY,
    query: query,
    limit: 1
  }, function (err, response) {
    if (err) {
      return callback(err);
    }

    // Return a formatted message
    return callback(null, formatSlackMessage(query, response));
  });
}
// [END makeSearchRequest]

// [START kgSearch]
/**
 * Receive a Slash Command request from Slack.
 *
 * Trigger this function by making a POST request with a payload to:
 * https://[YOUR_REGION].[YOUR_PROJECT_ID].cloudfunctions.net/kgsearch
 *
 * @example
 * curl -X POST "https://us-central1.your-project-id.cloudfunctions.net/kgSearch" --data '{"token":"[YOUR_SLACK_TOKEN]","text":"giraffe"}'
 *
 * @param {Object} req Cloud Function request object.
 * @param {Object} req.body The request payload.
 * @param {string} req.body.token Slack's verification token.
 * @param {string} req.body.text The user's search query.
 * @param {Object} res Cloud Function response object.
 */
exports.kgSearch = function kgSearch (req, res) {
  try {
    if (req.method !== 'POST') {
      var error = new Error('Only POST requests are accepted');
      error.code = 405;
      throw error;
    }

    // Verify that this request came from Slack
    verifyWebhook(req.body);

    // Make the request to the Knowledge Graph Search API
    makeSearchRequest(req.body.text, function (err, response) {
      if (err) {
        console.error(err);
        return res.status(500);
      }

      // Send the formatted message back to Slack
      return res.json(response);
    });
  } catch (err) {
    console.error(err);
    return res.status(err.code || 500).send(err.message);
  }
};
// [END kgSearch]
