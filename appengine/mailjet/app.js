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

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

// [START gae_flex_mailjet_config]
var Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);
// [END gae_flex_mailjet_config]

var app = express();

// Setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res) {
  res.render('index');
});

// [START gae_flex_mailjet_send_message]
app.post('/hello', function(req, res, next) {
  var options = {
    Messages: [
      {
        From: {
          Email: 'no-reply@appengine-mailjet-demo.com',
          Name: 'Mailjet Pilot',
        },
        To: [
          {
            Email: req.body.email,
          },
        ],
        Subject: 'Your email flight plan!',
        TextPart: 'Mailjet on Google App Engine with Node.js',
        HTMLPart: '<h3>Mailjet on Google App Engine with Node.js</h3>',
      },
    ],
  };

  var request = Mailjet.post('send', {version: 'v3.1'}).request(options);

  request
    .then(function(response, body) {
      console.log(response.statusCode, body);
      // Render the index route on success
      return res.render('index', {
        sent: true,
      });
    })
    .catch(function(err) {
      return next(err);
    });
});
// [END gae_flex_mailjet_send_message]

var server = app.listen(process.env.PORT || 8080, function() {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
