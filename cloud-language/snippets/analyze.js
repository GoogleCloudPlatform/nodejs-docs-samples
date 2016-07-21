// Copyright 2016, Google, Inc.
//
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

/**
 * @fileoverview Command-line program to demonstrate how to call different
 * methods in Cloud Natural Language API.
 *
 * To run this example, install npm:
 *   npm install
 *
 * You must also set up to authenticate with the Cloud APIs using your
 * project's service account credentials. See the README for details.
 *
 * To run:
 *   node analyze.js <sentiment|entities|syntax> <text>
 *
 * Here is an example:
 *   node analyze.js entities "President Obama is speaking at the White House."
 */
'use strict';

var google = require('googleapis');

var languageScopes = ['https://www.googleapis.com/auth/cloud-platform'];

/**
 * Gets a client that is connected to the Google Cloud Natural Language API.
 */
function getLanguageService (callback) {
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // Depending on the environment that provides the default credentials
    // (e.g. Compute Engine, App Engine), the credentials retrieved may
    // require you to specify the scopes you need explicitly.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped(languageScopes);
    }

    // Load the discovery document for the natural language api service, using
    // the acquired credentials.
    console.log('Loading language service...');
    google.discoverAPI({
      url: 'https://language.googleapis.com/$discovery/rest',
      version: 'v1beta1',
      auth: authClient
    }, function (err, languageService) {
      if (err) {
        return callback(err);
      }
      callback(null, languageService, authClient);
    });
  });
}

function analyzeSentiment (inputText, languageService, authClient, callback) {
  languageService.documents.analyzeSentiment(
    {
      auth: authClient,
      resource: { // Resource is used as the body for the API call.
        document: {
          content: inputText,
          type: 'PLAIN_TEXT'
        }
      }
    },
    function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
}

function analyzeEntities (inputText, languageService, authClient, callback) {
  languageService.documents.analyzeEntities(
    {
      auth: authClient,
      resource: { // Resource is used as the body for the API call.
        document: {
          content: inputText,
          type: 'PLAIN_TEXT'
        },
        encoding_type: 'UTF16'
      }
    },
    function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
}

function analyzeSyntax (inputText, languageService, authClient, callback) {
  languageService.documents.annotateText(
    {
      auth: authClient,
      resource: { // Resource is used as the body for the API call.
        document: {
          content: inputText,
          type: 'PLAIN_TEXT'
        },
        features: {
          extract_syntax: 'TRUE'
        },
        encoding_type: 'UTF16'
      }
    },
    function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    });
}

// Run the examples.
exports.main = function (command, inputText, callback) {
  getLanguageService(function (err, languageService, authClient) {
    if (err) {
      return callback(err);
    }

    var resultCallback = function (err, result) {
      if (err) {
        return callback(err);
      }
      callback(null, result);
    };
    if (command === 'sentiment') {
      analyzeSentiment(inputText, languageService, authClient, resultCallback);
    } else if (command === 'entities') {
      analyzeEntities(inputText, languageService, authClient, resultCallback);
    } else if (command === 'syntax') {
      analyzeSyntax(inputText, languageService, authClient, resultCallback);
    } else {
      return callback(err);
    }
  });
};

if (require.main === module) {
  var args = process.argv.slice(2);
  if (args.length !== 2) {
    console.log('Incorrect number of arguments. ' +
                'Usage: node analyze.js <sentiment|entities|syntax> <text>');
    process.exit(1);
  }
  if (['sentiment', 'entities', 'syntax'].indexOf(args[0]) === -1) {
    console.log('Incorrect command. ' +
                'Usage: node analyze.js <sentiment|entities|syntax> <text>');
    process.exit(1);
  }
  exports.main(args[0], args[1], function (err, result) {
    if (err) {
      console.error(err);
    }
    console.log(JSON.stringify(result, null, '  '));
  });
}
