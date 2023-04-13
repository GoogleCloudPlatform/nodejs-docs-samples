// Copyright 2022 Google LLC
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

// [START functions_tips_gcp_apis]
const functions = require('@google-cloud/functions-framework');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();

/**
 * HTTP Cloud Function that uses a cached client library instance to
 * reduce the number of connections required per function invocation.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} req.body Cloud Function request context body.
 * @param {String} req.body.topic The Cloud Pub/Sub topic to publish to.
 * @param {Object} res Cloud Function response context.
 */
functions.http('gcpApiCall', (req, res) => {
  const topic = pubsub.topic(req.body.topic);

  const data = Buffer.from('Test message');
  topic.publishMessage({data}, err => {
    if (err) {
      res.status(500).send(`Error publishing the message: ${err}`);
    } else {
      res.status(200).send('1 message published');
    }
  });
});
// [END functions_tips_gcp_apis]
