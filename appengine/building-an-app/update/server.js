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

// [START gae_update_web_server_app]
const express = require('express');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');

const app = express();

// [START gae_enable_parser]
// This middleware is available in Express v4.16.0 onwards
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));
app.use(csrf({cookie: true}));
// [END gae_enable_parser]

app.get('/', (req, res) => {
  res.send('Hello from App Engine!');
});

// [START gae_add_display_form]
app.get('/submit', (req, res) => {
  const token = req.csrfToken();
  res.send(`<!DOCTYPE html><html><head><title>My App Engine App</title></head><body><h2>Create a new post</h2><form method="POST" action="/submit"><input type="hidden" name="_csrf" value="${token}"><div><input type="text" name="name" placeholder="Name"></div><div><textarea name="message" placeholder="Message"></textarea></div><div><button type="submit">Submit</button></div></form></body></html>`);
});
// [END gae_add_display_form]

// [START gae_add_post_handler]
app.post('/submit', (req, res) => {
  console.log({
    name: req.body.name,
    message: req.body.message,
  });
  res.send('Thanks for your message!');
});
// [END gae_add_post_handler]

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = parseInt(process.env.PORT) || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
// [END gae_update_web_server_app]

module.exports = app;
