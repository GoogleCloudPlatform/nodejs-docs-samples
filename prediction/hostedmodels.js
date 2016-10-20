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

// [START predict]
var google = require('googleapis');
var hostedmodels = google.prediction('v1.6').hostedmodels;

function auth (callback) {
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or a Managed VM, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/prediction'
      ]);
    }
    callback(null, authClient);
  });
}

/**
 * @param {string} phrase The phrase for which to predict sentiment,
 * e.g. "good morning".
 * @param {Function} callback Callback function.
 */
function predict (phrase, callback) {
  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }
    // Predict the sentiment for the provided phrase
    hostedmodels.predict({
      auth: authClient,
      // Project id used for this sample
      project: '414649711441',
      hostedModelName: 'sample.sentiment',
      resource: {
        input: {
          // Predict sentiment of the provided phrase
          csvInstance: phrase.split(/\s/gi)
        }
      }
    }, function (err, prediction) {
      if (err) {
        return callback(err);
      }

      // Received prediction result
      console.log('Sentiment for "' + phrase + '": ' + prediction.outputLabel);
      callback(null, prediction);
    });
  });
}
// [END predict]

// Run the examples
exports.main = function (phrase, cb) {
  predict(phrase || 'good morning', cb || console.log);
};

if (module === require.main) {
  exports.main(process.argv.slice(2).shift());
}
