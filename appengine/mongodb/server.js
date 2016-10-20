// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//  http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var mongodb = require('mongodb');
var http = require('http');
var nconf = require('nconf');

// read in keys and secrets.  You can store these in a variety of ways.
// I like to use a keys.json  file that is in the .gitignore file,
// but you can also store them in environment variables
nconf.argv().env().file('keys.json');

// Connect to a MongoDB server provisioned over at
// MongoLab.  See the README for more info.

// [START client]
var uri = 'mongodb://' +
  nconf.get('mongoUser') + ':' +
  nconf.get('mongoPass') + '@' +
  nconf.get('mongoHost') + ':' +
  nconf.get('mongoPort');

if (nconf.get('mongoDatabase')) {
  uri = uri + '/' + nconf.get('mongoDatabase');
}

mongodb.MongoClient.connect(uri, function (err, db) {
  if (err) {
    throw err;
  }

  // Create a simple little server.
  http.createServer(function (req, res) {
    // Track every IP that has visited this site
    var collection = db.collection('IPs');

    var ip = {
      address: req.connection.remoteAddress
    };

    collection.insert(ip, function (err) {
      if (err) {
        throw err;
      }

      // push out a range
      var iplist = '';
      collection.find().toArray(function (err, data) {
        if (err) {
          throw err;
        }
        data.forEach(function (ip) {
          iplist += ip.address + '; ';
        });

        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.write('IPs:\n');
        res.end(iplist);
      });
    });
  }).listen(process.env.PORT || 8080, function () {
    console.log('started web process');
  });
});
// [END client]
