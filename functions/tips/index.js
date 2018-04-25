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

const Buffer = require('safe-buffer').Buffer;

const lightComputation = () => {
  const numbers = [1,2,3,4,5,6,7,8,9];
  return numbers.reduce((t, x) => t + x)
}

const heavyComputation = () => {
  // Multiplication is more computationally expensive than addition
  const numbers = [1,2,3,4,5,6,7,8,9];
  return numbers.reduce((t, x) => t * x)
}

const functionSpecificComputation = heavyComputation;
const fileWideComputation = lightweightComputation;

// [START functions_tips_scopes]
// Global (instance-wide) scope
// This computation runs at instance cold-start
const instanceVar = heavyComputation();

/**
 * Sample HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.scopeDemo = (req, res) => {
    // Per-function scope
    // This computation runs every time this function is called
    const functionVar = lightweightComputation();

    res.end(`Per instance: ${instanceVar}, per function: ${functionVar}`);
}
// [END functions_tips_scopes]

// [START functions_tips_lazy_globals]
// This value is always initialized, which happens at cold-start
const nonLazyGlobal = fileWideComputation();
let lazyGlobal;

/**
 * Sample HTTP Cloud Function.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.lazyGlobals = (req, res) => {
  // This value is initialized only if (and when) the function is called
  lazyGlobal = lazyGlobal || functionSpecificComputation();

  res.end(`Lazy global: ${lazyGlobal}, non-lazy global: ${nonLazyGlobal}`);
}
// [END functions_tips_lazy_globals]

// [START functions_tips_ephemeral_connection]
// [START functions_tips_cached_connection]
const http = require('http');
// [END functions_tips_ephemeral_connection]
const agent = new http.Agent({keepAlive: true});
// [END functions_tips_cached_connection]

// TODO(ace-n) make sure this import works as intended
// [START functions_tips_ephemeral_connection]
exports.ephemeralConnection = (req, res) => {
  req = http.request({
    host: '<HOST>',
    port: 80,
    path: '<PATH>',
    method: 'GET',
  }, res => {
    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { rawData += chunk; });
    res.on('end', () => {
      response.status(200).send(`Data: ${rawData}`);
    });
  });
  req.on('error', (e) => {
    response.status(500).send(`Error: ${e.message}`);
  });
  req.end();
};
// [END functions_tips_ephemeral_connection]

// [START functions_tips_cached_connection]
exports.cachedConnection = (request, response) => {
  req = http.request({
    host: '',
    port: 80,
    path: '',
    method: 'GET',
    agent: agent,
  }, res => {
    let rawData = '';
    res.setEncoding('utf8');
    res.on('data', chunk => { rawData += chunk; });
    res.on('end', () => {
      response.status(200).send(`Data: ${rawData}`);
    });
  });
  req.on('error', e => {
    response.status(500).send(`Error: ${e.message}`);
  });
  req.end();
};
// [END functions_tips_cached_connection]
