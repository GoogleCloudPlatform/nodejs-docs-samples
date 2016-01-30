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

var format = require('util').format;
var express = require('express');
var gcloud = require('gcloud');
var crypto = require('crypto');

var app = express();
app.enable('trust proxy');

var dataset = gcloud.datastore.dataset({
  // This environment variable is set by app.yaml when running on GAE, but will
  // need to be manually set when running locally.
  projectId: process.env.GCLOUD_PROJECT
});

app.get('/', function(req, res, next) {
  var hash = crypto.createHash('sha256');

  // Add this visit to the datastore
  dataset.save({
    key: dataset.key('visit'),
    data: {
      timestamp: new Date(),
      // Store a hash of the ip address
      userIp: hash.update(req.ip).digest('hex').substr(0, 7)
    }
  }, function(err) {
    if (err) { return next(err); }

    // Query the last 10 visits from the datastore.
    var query = dataset.createQuery('visit')
      .order('-timestamp')
      .limit(10);

    dataset.runQuery(query, function(err, entities) {
      if (err) { return next(err); }

      var visits = entities.map(function(entity) {
        return format(
          'Time: %s, AddrHash: %s',
          entity.data.timestamp,
          entity.data.userIp);
      });

      var output = format('Last 10 visits:\n%s', visits.join('\n'));

      res.set('Content-Type', 'text/plain');
      res.status(200).send(output);
    });
  });
});

/* Start the server */
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address,
    server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
