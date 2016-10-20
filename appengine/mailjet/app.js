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

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

// [START setup]
var Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);
// [END setup]

var app = express();

// Setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// [START index]
app.get('/', function (req, res) {
  res.render('index');
});
// [END index]

// [START hello]
app.post('/hello', function (req, res, next) {
  var options = {
    // From
    FromEmail: 'no-reply@appengine-mailjet-demo.com',
    FromName: 'Mailjet Demo',
    // To
    Recipients: [{ Email: req.body.email }],
    // Subject
    Subject: 'Hello World!',
    // Body
    'Text-part': 'Mailjet on Google App Engine with Node.js',
    'Html-part': '<h3>Mailjet on Google App Engine with Node.js</h3>'
  };

  var request = Mailjet.post('send').request(options);

  request
    .on('success', function (response, body) {
      console.log(response.statusCode, body);
      // Render the index route on success
      return res.render('index', {
        sent: true
      });
    })
    .on('error', function (err) {
      return next(err);
    });
});
// [END hello]

// [START server]
var server = app.listen(process.env.PORT || 8080, function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END server]

