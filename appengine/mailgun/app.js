// Copyright 2015-2016, Google, Inc.
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
var Mailgun = require('mailgun').Mailgun;
var mg = new Mailgun(process.env.MAILGUN_API_KEY);
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
  var servername = '';
  var options = {};

  mg.sendText(
    // From
    'no-reply@appengine-mailgun-demo.com',
    // To
    req.body.email,
    // Subject
    'Hello World!',
    // Body
    'Mailgun on Google App Engine with Node.js',
    servername,
    options,
    function (err) {
      if (err) {
        return next(err);
      }
      // Render the index route on success
      return res.render('index', {
        sent: true
      });
    }
  );
});
// [END hello]

// [START server]
var server = app.listen(process.env.PORT || 8080, function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END server]
