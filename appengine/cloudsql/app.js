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
var mysql = require('mysql');
var crypto = require('crypto');

var app = express();
app.enable('trust proxy');

// These environment variables are set by app.yaml when running on GAE, but
// will need to be manually set when running locally.
// If you're connecting via SSL you will need to specify your certs here, see
// https://github.com/felixge/node-mysql/#ssl-options
var connection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
});

app.get('/', function (req, res, next) {
  var hash = crypto.createHash('sha256');

  // Add this visit to the database
  var visit = {
    timestamp: new Date(),
    // Store a hash of the ip address
    userIp: hash.update(req.ip).digest('hex').substr(0, 7)
  };

  connection.query('INSERT INTO `visits` SET ?', visit, function (err) {
    if (err) {
      return next(err);
    }

    // Query the last 10 visits from the database.
    connection.query(
      'SELECT `timestamp`, `userIp` FROM `visits` ORDER BY `timestamp` DESC ' +
      'LIMIT 10',
      function (err, results) {
        if (err) {
          return next(err);
        }

        var visits = results.map(function (visit) {
          return format(
            'Time: %s, AddrHash: %s',
            visit.timestamp,
            visit.userIp);
        });

        var output = format('Last 10 visits:\n%s', visits.join('\n'));

        res.set('Content-Type', 'text/plain');
        res.status(200).send(output);
      });
  });
});

var server = app.listen(process.env.PORT || 8080, function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
