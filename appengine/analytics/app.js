// Copyright 2018 Google LLC
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

// [START gae_flex_analytics_track_event]
const express = require('express');
const fetch = require('node-fetch');

const app = express();
app.enable('trust proxy');

// The following environment variable is set by app.yaml when running on App
// Engine, but will need to be set manually when running locally. See README.md.
const {GA_TRACKING_ID} = process.env;

const trackEvent = (category, action, label, value) => {
  const data = {
    // API Version.
    v: '1',
    // Tracking ID / Property ID.
    tid: GA_TRACKING_ID,
    // Anonymous Client Identifier. Ideally, this should be a UUID that
    // is associated with particular user, device, or browser instance.
    cid: '555',
    // Event hit type.
    t: 'event',
    // Event category.
    ec: category,
    // Event action.
    ea: action,
    // Event label.
    el: label,
    // Event value.
    ev: value,
  };

  return fetch('http://www.google-analytics.com/debug/collect', {
    params: data,
  });
};

app.get('/', async (req, res, next) => {
  // Event value must be numeric.
  try {
    await trackEvent(
      'Example category',
      'Example action',
      'Example label',
      '100'
    );
    res.status(200).send('Event tracked.').end();
  } catch (error) {
    // This sample treats an event tracking error as a fatal error. Depending
    // on your application's needs, failing to track an event may not be
    // considered an error.
    next(error);
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// [END gae_flex_analytics_track_event]

module.exports = app;
