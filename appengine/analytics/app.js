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

// [START app]
'use strict';

// [START setup]
const express = require('express');
const request = require('request');

const app = express();
app.enable('trust proxy');
// [END setup]

// [START track]
// The following environment variable is set by app.yaml when running on GAE,
// but will need to be manually set when running locally. See README.md.
const GA_TRACKING_ID = process.env.GA_TRACKING_ID;

function trackEvent (category, action, label, value, cb) {
  const data = {
    v: '1', // API Version.
    tid: GA_TRACKING_ID, // Tracking ID / Property ID.
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: '555',
    t: 'event', // Event hit type.
    ec: category, // Event category.
    ea: action, // Event action.
    el: label, // Event label.
    ev: value // Event value.
  };

  request.post(
    'http://www.google-analytics.com/collect',
    {
      form: data
    },
    (err, response) => {
      if (err) {
        cb(err);
        return;
      }
      if (response.statusCode !== 200) {
        cb(new Error('Tracking failed'));
        return;
      }
      cb();
    }
  );
}
// [END track]

// [START endpoint]
app.get('/', (req, res, next) => {
  trackEvent(
    'Example category',
    'Example action',
    'Example label',
    '100', // Event value must be numeric.
    (err) => {
      // This sample treats an event tracking error as a fatal error. Depending
      // on your application's needs, failing to track an event may not be
      // considered an error.
      if (err) {
        next(err);
        return;
      }
      res.status(200).send('Event tracked.');
    });
});
// [END endpoint]

// [START listen]
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
