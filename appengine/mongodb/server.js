/**
 * Copyright 2016, Google, Inc.
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

'use strict';

const mongodb = require('mongodb');
const http = require('http');
const nconf = require('nconf');

// read in keys and secrets.  You can store these in a variety of ways.
// I like to use a keys.json  file that is in the .gitignore file,
// but you can also store them in environment variables
nconf.argv().env().file('keys.json');

// Connect to a MongoDB server provisioned over at
// MongoLab.  See the README for more info.

const user = nconf.get('mongoUser');
const pass = nconf.get('mongoPass');
const host = nconf.get('mongoHost');
const port = nconf.get('mongoPort');

// [START client]
let uri = `mongodb://${user}:${pass}@${host}:${port}`;

if (nconf.get('mongoDatabase')) {
  uri = `${uri}/${nconf.get('mongoDatabase')}`;
}

console.log(uri);

mongodb.MongoClient.connect(uri, (err, db) => {
  if (err) {
    throw err;
  }

  // Create a simple little server.
  http.createServer((req, res) => {
    // Track every IP that has visited this site
    const collection = db.collection('IPs');

    const ip = {
      address: req.connection.remoteAddress
    };

    collection.insert(ip, (err) => {
      if (err) {
        throw err;
      }

      // push out a range
      let iplist = '';
      collection.find().toArray((err, data) => {
        if (err) {
          throw err;
        }
        data.forEach((ip) => {
          iplist += `${ip.address}; `;
        });

        res.writeHead(200, {
          'Content-Type': 'text/plain'
        });
        res.write('IPs:\n');
        res.end(iplist);
      });
    });
  }).listen(process.env.PORT || 8080, () => {
    console.log('started web process');
  });
});
// [END client]
