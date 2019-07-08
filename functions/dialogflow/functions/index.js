/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*jshint esversion: 6 */
/* jshint node: true */

'use strict';

const admin = require('firebase-admin');
const functions = require('firebase-functions');
const http = require('http');
const https = require('https');
admin.initializeApp(functions.config().firebase);
const db = admin.firestore();

// [START save_token_to_firebase]
function saveOAuthToken(context, oauthToken) {
  const docRef = db.collection('ShortLivedAuthTokens').doc('OauthToken');
  docRef.set(oauthToken);
}
// [END save_token_to_firebase]

// [START generate_token]
function generateAccessToken(
  context,
  serviceAccountAccessToken,
  serviceAccountTokenType
) {
  // With the service account's credentials, we can make a request to generate
  // a new token for a 2nd service account that only has the permission to
  // act as a Dialogflow Client
  return new Promise(resolve => {
    const post_options = {
      host: 'iamcredentials.googleapis.com',
      path:
        '/v1/projects/-/serviceAccounts/SERVICE-ACCOUNT-NAME@YOUR_PROJECT_ID.iam.gserviceaccount.com:generateAccessToken',
      method: 'POST',
      headers: {
        // Set Service Account Credentials
        Authorization:
          serviceAccountTokenType + ' ' + serviceAccountAccessToken,
      },
    };

    // Set up the request
    let oauthToken = '';
    const post_req = https.request(post_options, res => {
      res.setEncoding('utf8');
      res.on('data', chunk => {
        oauthToken += chunk;
      });
      res.on('end', () => {
        // Next step in pipeline
        saveOAuthToken(context, JSON.parse(oauthToken));
        return resolve(JSON.parse(oauthToken));
      });
    });

    post_req.on('error', e => {
      console.log('ERROR generating new token', e.message);
      return 'Error retrieving token';
    });

    // Sets up the scope that we want the end user to have.
    const body = {
      delegates: [],
      scope: ['https://www.googleapis.com/auth/dialogflow'],
      lifetime: '3599s',
    };

    // post the data
    post_req.write(JSON.stringify(body));
    post_req.end();
  });
}
// [END generate_token]

// [START retrieve_credentials]
function retrieveCredentials(context) {
  return new Promise(resolve => {
    // To create a new access token, we first have to retrieve the credentials
    // of the service account that will make the generateTokenRequest().
    // To do that, we will use the App Engine Default Service Account.
    const options = {
      host: 'metadata.google.internal',
      path: '/computeMetadata/v1/instance/service-accounts/default/token',
      method: 'GET',
      headers: {'Metadata-Flavor': 'Google'},
    };

    const get_req = http.get(options, res => {
      let body = '';

      res.on('data', chunk => {
        body += chunk;
      });

      res.on('end', () => {
        const response = JSON.parse(body);
        return generateAccessToken(
          context,
          response.access_token,
          response.token_type
        ).then(result => {
          return resolve(result);
        });
      });
    });
    get_req.on('error', e => {
      //console.log('Error retrieving credentials', e.message);
      return 'Error retrieving token' + e.message;
    });
    get_req.end();
  });
}
exports.retrieveCredentials = retrieveCredentials;
// [END retrieve_credentials]

// [START validate_token]
// This method verifies the token expiry by validating against current time
function isValid(expiryTime) {
  const currentDate = new Date();
  const expirationDate = new Date(expiryTime);
  // If within 5 minutes of expiration, return false
  return currentDate <= expirationDate - 1000 * 60 * 5;
}
// [END validate_token]

// [START function_get_token]
exports.getOAuthToken = functions.https.onCall((data, context) => {
  // Checking that the user is authenticated.
  if (!context.auth) {
    // Throwing an HttpsError so that the client gets the error details.
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called ' + 'while authenticated.'
    );
  }
  // Retrieve the token from the database
  const docRef = db.collection('ShortLivedAuthTokens').doc('OauthToken');

  return docRef
    .get()
    .then(doc => {
      if (doc.exists && isValid(doc.data().expireTime)) {
        //push notification
        pushNotification(
          data['deviceID'],
          doc.data().accessToken,
          doc.data().expireTime
        );
        return doc.data();
      } else {
        return retrieveCredentials(context).then(result => {
          console.log('Print result from retrieveCredentials functions');
          console.log(result);
          pushNotification(
            data['deviceID'],
            result['accessToken'],
            result['expireTime']
          );
          return result;
        });
      }
    })
    .catch(err => {
      console.log('Error retrieving token', err);
      pushNotification(data['deviceID'], 'Error retrieving token', 'Error');
      // return 'Error retrieving token';
      return 'Error retrieving token';
    });
});
// [END function_get_token]

//[START pushNotification]
function pushNotification(deviceID, accessToken, expiryDate) {
  //Passing the device id of the requested device which has requested for PN
  const tokens = [deviceID];
  //Push notification payload with expiry date as title and access token as body
  //Though payload can be consructed in different ways just for simplicity we had choosen this
  const payload = {
    notification: {
      title: expiryDate,
      body: accessToken,
      sound: 'default',
      badge: '1',
    },
  };
  //triggers push notification to the targeted devices.
  return admin.messaging().sendToDevice(tokens, payload);
}
//[END pushNotification]
