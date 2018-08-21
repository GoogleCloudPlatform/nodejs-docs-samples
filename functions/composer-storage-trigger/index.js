/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START composer_trigger]
/**
 * Triggered from a message on a Cloud Storage bucket.
 *
 * IAP authorization based on:
 * https://stackoverflow.com/questions/45787676/how-to-authenticate-google-cloud-functions-for-access-to-secure-app-engine-endpo
 * and
 * https://cloud.google.com/iap/docs/authentication-howto
 *
 * @param {!Object} event The Cloud Functions event.
 * @param {!Function} callback The callback function.
 */
exports.triggerDag = function triggerDag (event, callback) {
  // Fill in your Composer environment information here.

  // The project that holds your function
  const PROJECT_ID = 'your-project-id';
  // Navigate to your webserver's login page and get this from the URL
  const CLIENT_ID = 'your-iap-client-id';
  // This should be part of your webserver's URL:
  // {tenant-project-id}.appspot.com
  const WEBSERVER_ID = 'your-tenant-project-id';
  // The name of the DAG you wish to trigger
  const DAG_NAME = 'composer_sample_trigger_response_dag';

  // Other constants
  const WEBSERVER_URL = 'https://' + WEBSERVER_ID +
        '.appspot.com/api/experimental/dags/' + DAG_NAME + '/dag_runs';
  const USER_AGENT = 'gcf-event-trigger';
  const BODY = {'conf': JSON.stringify(event.data)};

  // Make the request
  authorizeIap(
    CLIENT_ID, PROJECT_ID, USER_AGENT,
    function iapAuthorizationCallback (err, jwt, idToken) {
      if (err) {
        return callback(err);
      }
      makeIapPostRequest(
        WEBSERVER_URL, BODY, idToken, USER_AGENT, jwt, callback);
    });
};

/**
   * @param {string} clientId The client id associated with the Composer webserver application.
   * @param {string} projectId The id for the project containing the Cloud Function.
   * @param {string} userAgent The user agent string which will be provided with the webserver request.
   * @param {!Function} callback A callback accepting error, jwt, and idToken arguments.
   */
function authorizeIap (clientId, projectId, userAgent, callback) {
  const request = require('request');

  const SERVICE_ACCOUNT = [projectId, '@appspot.gserviceaccount.com'].join('');

  var options = {
    url: [
      'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/',
      SERVICE_ACCOUNT, '/token'
    ].join(''),
    headers: {'User-Agent': userAgent, 'Metadata-Flavor': 'Google'}
  };
    // Obtain an Oauth2 access token for the appspot service account
  request(options, function obtainAccessTokenCallback (err, res, body) {
    if (err) {
      return callback(err);
    }
    if (body.error) {
      return callback(body);
    }
    var tokenResponse = JSON.parse(body);
    var accessToken = tokenResponse.access_token;
    var jwtHeader = Buffer.from(JSON.stringify({alg: 'RS256', typ: 'JWT'}))
      .toString('base64');
    var iat = Math.floor(new Date().getTime() / 1000);
    var claims = {
      iss: SERVICE_ACCOUNT,
      aud: 'https://www.googleapis.com/oauth2/v4/token',
      iat: iat,
      exp: iat + 60,
      target_audience: clientId
    };
    var jwtClaimset = Buffer.from(JSON.stringify(claims)).toString('base64');
    var toSign = [jwtHeader, jwtClaimset].join('.');
    var options = {
      url: [
        'https://iam.googleapis.com/v1/projects/', projectId,
        '/serviceAccounts/', SERVICE_ACCOUNT, ':signBlob'
      ].join(''),
      method: 'POST',
      json: {'bytesToSign': Buffer.from(toSign).toString('base64')},
      headers: {
        'User-Agent': userAgent,
        'Authorization': ['Bearer', accessToken].join(' ')
      }
    };
      // Request service account signature on header and claimset
    request(options, function signJsonClaimCallback (err, res, body) {
      if (err) {
        return callback(err);
      }
      if (body.error) {
        return callback(body);
      }
      var jwtSignature = body.signature;
      var jwt = [jwtHeader, jwtClaimset, jwtSignature].join('.');
      var options = {
        url: 'https://www.googleapis.com/oauth2/v4/token',
        form: {
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt
        }
      };
        // Request oauth id token with jwt header, claims, and signature
      request.post(options, function getIdTokenCallback (err, res, body) {
        if (err) {
          return callback(err);
        }
        if (body.error) {
          return callback(body);
        }
        var idToken = JSON.parse(body).id_token;
        callback(null, jwt, idToken);
      });
    });
  });
}

/**
   * @param {string} url The url that the post request targets.
   * @param {string} body The body of the post request.
   * @param {string} idToken Bearer token used to authorize the iap request.
   * @param {string} userAgent The user agent to identify the requester.
   * @param {string} jwt A Json web token used to authenticate the request.
   * @param {!Function} callback The Cloud Functions callback.
   */
function makeIapPostRequest (url, body, idToken, userAgent, jwt, callback) {
  const request = require('request');

  request.post(
    {
      url: url,
      form: {
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt
      }
    },
    function makeIapPostRequestCallback (err, res) {
      if (err) {
        return callback(err);
      }

      var options = {
        url: url,
        headers: {
          'User-Agent': userAgent,
          'Authorization': ['Bearer', idToken].join(' ')
        },
        method: 'POST',
        json: body
      };
      request(options, function (err, res, body) {
        callback(err);
      });
    });
}
// [END composer_trigger]
