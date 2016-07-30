// Copyright 2015-2016, Google, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START app]
'use strict';

// [START setup]
var express = require('express');
var request = require('request');

var app = express();
app.enable('trust proxy');
// [END setup]

// [START track]
// The following environment variable is set by app.yaml when running on GAE,
// but will need to be manually set when running locally. See README.md.
var GA_TRACKING_ID = process.env.GA_TRACKING_ID;

function trackEvent (category, action, label, value, cb) {
  var data = {
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
    'http://www.google-analytics.com/collect', {
      form: data
    },
    function (err, response) {
      if (err) {
        return cb(err);
      }
      if (response.statusCode !== 200) {
        return cb(new Error('Tracking failed'));
      }
      cb();
    }
  );
}
// [END track]

// [START endpoint]
app.get('/', function (req, res, next) {
  trackEvent(
    'Example category',
    'Example action',
    'Example label',
    '100', // Event value must be numeric.
    function (err) {
      // This sample treats an event tracking error as a fatal error. Depending
      // on your application's needs, failing to track an event may not be
      // considered an error.
      if (err) {
        return next(err);
      }
      res.status(200).send('Event tracked.');
    });
});
// [END endpoint]

// [START listen]
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log('App listening on port %s', PORT);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
