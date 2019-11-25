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

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

// [START gae_flex_mailjet_config]
const Mailjet = require('node-mailjet').connect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);
// [END gae_flex_mailjet_config]

const app = express();

// Setup view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Parse form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.render('index');
});

// [START gae_flex_mailjet_send_message]
app.post('/hello', async (req, res, next) => {
  const options = {
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

  try {
    const [response, body] = await Mailjet.post('send', {
      version: 'v3.1',
    }).request(options);
    console.log(response.statusCode, body);
    // Render the index route on success
    return res.render('index', {
      sent: true,
    });
  } catch (err) {
    return next(err);
  }
});
// [END gae_flex_mailjet_send_message]

const server = app.listen(process.env.PORT || 8080, () => {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
