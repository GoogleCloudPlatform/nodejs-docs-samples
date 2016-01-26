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

var express = require('express');
var bodyParser = require('body-parser');
var gcloud = require('gcloud');

var app = express();
app.set('view engine', 'jade');

var formBodyParser = bodyParser.urlencoded({extended: false});
var jsonBodyParser = bodyParser.json();

// List of all messages received by this instance
var messages = [];

// The following environment variables are set by app.yaml when running on GAE,
// but will need to be manually set when running locally.
var PUBSUB_VERIFICATION_TOKEN = process.env.PUBSUB_VERIFICATION_TOKEN;

// You must set the GCLOUD_PROJECT and GOOGLE_APPLICATION_CREDENTIALS
// environment variables to run this sample
var pubsub = gcloud.pubsub({
  projectId: process.env.GCLOUD_PROJECT
});

var topic = pubsub.topic(process.env.PUBSUB_TOPIC);

// [START index]
app.get('/', function(req, res) {
  res.render('index', {messages: messages});
});

app.post('/', formBodyParser, function(req, res, next) {
  if(!req.body.payload) {
    return res.status(400).send('Missing payload');
  }

  topic.publish({
      data: req.body.payload
    },
    function(err){
      if(err) { return next(err); }
      res.status(200).send('Message sent');
    });
});
// [END index]

// [START push]
app.post('/pubsub/push', jsonBodyParser, function(req, res) {
  if(req.query.token !== PUBSUB_VERIFICATION_TOKEN) {
    return res.status(400).send();
  }

  // The message is a unicode string encoded in base64.
  var message = new Buffer(req.body.message.data, 'base64').toString('utf-8');

  messages.push(message);

  res.status(200).send();
});
// [END push]

// Start the server
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address,
    server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
