/**
 * Copyright 2018, Google, Inc.
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

const lightComputation = () => {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.reduce((t, x) => t + x);
};

const heavyComputation = () => {
  // Multiplication is more computationally expensive than addition
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return numbers.reduce((t, x) => t * x);
};

const functionSpecificComputation = heavyComputation;
const fileWideComputation = lightComputation;

// [START functions_tips_scopes]
// Global (instance-wide) scope
// This computation runs at instance cold-start
const instanceVar = heavyComputation();

/**
 * HTTP Cloud Function that declares a variable.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.scopeDemo = (req, res) => {
  // Per-function scope
  // This computation runs every time this function is called
  const functionVar = lightComputation();

  res.send(`Per instance: ${instanceVar}, per function: ${functionVar}`);
};
// [END functions_tips_scopes]

// [START functions_tips_lazy_globals]
// Always initialized (at cold-start)
const nonLazyGlobal = fileWideComputation();

// Declared at cold-start, but only initialized if/when the function executes
let lazyGlobal;

/**
 * HTTP Cloud Function that uses lazy-initialized globals
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.lazyGlobals = (req, res) => {
  // This value is initialized only if (and when) the function is called
  lazyGlobal = lazyGlobal || functionSpecificComputation();

  res.send(`Lazy global: ${lazyGlobal}, non-lazy global: ${nonLazyGlobal}`);
};
// [END functions_tips_lazy_globals]

// [START functions_tips_connection_pooling]
const http = require('http');
const agent = new http.Agent({keepAlive: true});

/**
 * HTTP Cloud Function that caches an HTTP agent to pool HTTP connections.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.connectionPooling = (req, res) => {
  req = http.request({
    host: '',
    port: 80,
    path: '',
    method: 'GET',
    agent: agent
  }, resInner => {
    let rawData = '';
    resInner.setEncoding('utf8');
    resInner.on('data', chunk => { rawData += chunk; });
    resInner.on('end', () => {
      res.status(200).send(`Data: ${rawData}`);
    });
  });
  req.on('error', e => {
    res.status(500).send(`Error: ${e.message}`);
  });
  req.end();
};
// [END functions_tips_connection_pooling]

// [START functions_tips_infinite_retries]
/**
 * Background Cloud Function that only executes within
 * a certain time period after the triggering event
 *
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.avoidInfiniteRetries = (event, callback) => {
  const eventAge = Date.now() - Date.parse(event.timestamp);
  const eventMaxAge = 10000;

  // Ignore events that are too old
  if (eventAge > eventMaxAge) {
    console.log(`Dropping event ${event} with age ${eventAge} ms.`);
    callback();
    return;
  }

  // Do what the function is supposed to do
  console.log(`Processing event ${event} with age ${eventAge} ms.`);
  callback();
};
// [END functions_tips_infinite_retries]

// [START functions_tips_retry]
/**
 * Background Cloud Function that demonstrates
 * how to toggle retries using a promise
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data Data included with the event.
 * @param {object} event.data.retry Whether or not to retry the function.
 */
exports.retryPromise = (event) => {
  const tryAgain = !!event.data.retry;

  if (tryAgain) {
    throw new Error(`Retrying...`);
  } else {
    return Promise.reject(new Error('Not retrying...'));
  }
};

/**
 * Background Cloud Function that demonstrates
 * how to toggle retries using a callback
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.data Data included with the event.
 * @param {object} event.data.retry Whether or not to retry the function.
 * @param {function} callback The callback function.
 */
exports.retryCallback = (event, callback) => {
  const tryAgain = !!event.data.retry;
  const err = new Error('Error!');

  if (tryAgain) {
    console.error('Retrying:', err);
    callback(err);
  } else {
    console.error('Not retrying:', err);
    callback();
  }
};
// [END functions_tips_retry]

// [START functions_tips_gcp_apis]
const Pubsub = require('@google-cloud/pubsub');
const pubsub = Pubsub();

/**
 * HTTP Cloud Function that uses a cached client library instance to
 * reduce the number of connections required per function invocation.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} req.body Cloud Function request context body.
 * @param {String} req.body.topic The Cloud Pub/Sub topic to publish to.
 * @param {Object} res Cloud Function response context.
 */
exports.gcpApiCall = (req, res) => {
  const topic = pubsub.topic(req.body.topic);

  topic.publish('Test message', err => {
    if (err) {
      res.status(500).send(`Error publishing the message: ${err}`);
    } else {
      res.status(200).send('1 message published');
    }
  });
};
// [END functions_tips_gcp_apis]
