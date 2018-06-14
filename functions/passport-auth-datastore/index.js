/**
 * Copyright 2017, Google, Inc.
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

/**
 * This sample demonstrates the following:
 *
 * 1. A foreground (HTTP) function accessed directly by end users.
 * 2. Asking the user for permission via OAuth 2 to access a Google API.
 * 3. Storing the user's ID in a cookie session.
 * 4. Loading the user's profile and access token from Cloud Datastore.
 * 5. Loading the user's most recent files from the Google Drive API.
 */

'use strict';

const cookieSession = require('cookie-session');
const datastore = require('@google-cloud/datastore')();
const express = require('express');
const google = require('googleapis');
const passport = require('passport');
const Strategy = require('passport-google-oauth20').Strategy;

const app = express();
const drive = google.drive('v3');
const OAuth2Client = google.auth.OAuth2;

const CLIENT_ID = 'YOUR_CLIENT_ID'; // TODO(developer): Set this value
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET'; // TODO(developer): Set this value
const SCOPES = [
  // The userinfo.email scope seems to be required
  'https://www.googleapis.com/auth/userinfo.email',
  // TODO(developer): Add the scopes you need here
  'https://www.googleapis.com/auth/drive.readonly'
];

const PROJECT_ID = process.env.GCLOUD_PROJECT;
// Use this base path with the Cloud Functions Emulator
let BASE_PATH = `http://localhost:8010/${PROJECT_ID}/us-central1/listRecentFiles`;
if (process.env.NODE_ENV === 'production') {
  // Use this base path for the deployed function
  BASE_PATH = `https://us-central1-${PROJECT_ID}.cloudfunctions.net/listRecentFiles`;
}
const CALLBACK_URL = `${BASE_PATH}/auth/callback`;

passport.use(new Strategy({
  clientID: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  callbackURL: CALLBACK_URL
}, (accessToken, refreshToken, profile, cb) => {
  const entity = {
    key: datastore.key(['User', profile.id]),
    data: {
      access_token: accessToken,
      refresh_token: refreshToken
    }
  };

  // Save the access token and refresh token to Cloud Datastore
  datastore.save(entity, (err) => cb(err, profile));
}));

// Save only the user's ID to the cookie session
passport.serializeUser((user, cb) => cb(null, user.id));
// Deserialize the user from the session by loading it from Cloud Datastore
passport.deserializeUser((id, cb) => {
  const key = datastore.key(['User', id]);
  datastore.get(key, cb);
});

app.use(cookieSession({
  keys: ['your-secret-key'],
  maxAge: 24 * 60 * 60 * 1000 // Cookies expire after 24 hours
  /**
   * Set other cookie options here as desired to make the cookie more secure.
   */
}));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

app.get('/',
  // Retrieves an access token in case we don't already have one
  require('connect-ensure-login').ensureLoggedIn(`${BASE_PATH}/auth`),
  // Lists the user's 5 most recent files
  (req, res) => {
    const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, CALLBACK_URL);
    oauth2Client.setCredentials(req.user);

    const params = {
      pageSize: 5, // Limit the result to 5 files
      orderBy: 'recency desc', // Load the user's most recent files
      auth: oauth2Client // This will refresh the access token if necessary
    };

    // Makes a request to https://www.googleapis.com/drive/v3/files
    drive.files.list(params, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message).end();
        return;
      }

      res.status(200).send(result.files).end();
    });
  }
);

// Handler for authenticating the user
app.get('/auth', passport.authenticate('google', {
  scope: SCOPES,
  accessType: 'offline'
}));

// Handler for OAuth2 callback url
app.get('/auth/callback',
  passport.authenticate('google', { failureRedirect: `${BASE_PATH}/auth` }),
  (req, res) => res.redirect(BASE_PATH)
);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send(err.message).end();
});

exports.listRecentFiles = app;
