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

// [START setup]
var express = require('express');
var crypto = require('crypto');

var app = express();
app.enable('trust proxy');

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
// These environment variables are set automatically on Google App Engine
var Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
var datastore = Datastore();
// [END setup]

// [START insertVisit]
/**
 * Insert a visit record into the database.
 *
 * @param {object} visit The visit record to insert.
 * @param {function} callback The callback function.
 */
function insertVisit (visit, callback) {
  datastore.save({
    key: datastore.key('visit'),
    data: visit
  }, function (err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
}
// [END insertVisit]

// [START getVisits]
/**
 * Retrieve the latest 10 visit records from the database.
 *
 * @param {function} callback The callback function.
 */
function getVisits (callback) {
  var query = datastore.createQuery('visit')
    .order('-timestamp')
    .limit(10);

  datastore.runQuery(query, function (err, entities) {
    if (err) {
      return callback(err);
    }
    return callback(null, entities.map(function (entity) {
      return 'Time: ' + entity.data.timestamp + ', AddrHash: ' + entity.data.userIp;
    }));
  });
}
// [END getVisits]

app.get('/', function (req, res, next) {
  // Create a visit record to be stored in the database
  var visit = {
    timestamp: new Date(),
    // Store a hash of the visitor's ip address
    userIp: crypto.createHash('sha256').update(req.ip).digest('hex').substr(0, 7)
  };

  insertVisit(visit, function (err) {
    if (err) {
      return next(err);
    }

    // Query the last 10 visits from the datastore.
    getVisits(function (err, visits) {
      if (err) {
        return next(err);
      }

      return res
        .status(200)
        .set('Content-Type', 'text/plain')
        .send('Last 10 visits:\n' + visits.join('\n'));
    });
  });
});

// [START listen]
var server = app.listen(process.env.PORT || 8080, function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END listen]
// [END app]

module.exports = app;
