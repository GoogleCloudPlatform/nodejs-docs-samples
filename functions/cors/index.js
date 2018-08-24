/**
 * Copyright 2018, Google, LLC.
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

// [START functions_cors]
exports.corsEnabledFunction = (req, res) => {
  // Set CORS headers for preflight requests
  // e.g. allow GETs from any origin with the Content-Type header
  // and cache preflight response for an 3600s
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  res.set('Access-Control-Max-Age', '3600');

  // Send response to OPTIONS requests and terminate the function execution
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
  }

  // Set CORS headers for the main request
  res.removeHeader('Access-Control-Allow-Methods');
  res.removeHeader('Access-Control-Allow-Headers');
  res.removeHeader('Access-Control-Max-Age');

  res.send('Hello World!');
};
// [END functions_cors]

// [START functions_cors_auth]
exports.corsEnabledFunctionAuth = (req, res) => {
  // Set CORS headers for preflight requests
  // allows GETS from origin https://mydomain.com with Authorization header
  res.set('Access-Control-Allow-Origin', 'https://mydomain.com');
  res.set('Access-Control-Allow-Methods', 'GET');
  res.set('Access-Control-Allow-Headers', 'Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');

  // Send response to OPTIONS requests and terminate the function execution
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
  }

  res.removeHeader('Access-Control-Allow-Methods');
  res.removeHeader('Access-Control-Allow-Headers');
  res.removeHeader('Access-Control-Max-Age');

  res.send('Hello World!');
};
// [END functions_cors_auth]
