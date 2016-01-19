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

// [START all]
'use strict';

var mysql = require('mysql');
var prompt = require('prompt');

prompt.start();

prompt.get(['host', 'user', 'password', 'database'], function(err, config) {
  if (err) { return; }

  config.multipleStatements = true;

  var connection = mysql.createConnection(config);

  connection.query(
    'CREATE TABLE `visits` (' +
    '  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,' +
    '  `timestamp` DATETIME NULL,' +
    '  `userIp` VARCHAR(46) NULL,' +
    '  PRIMARY KEY (`id`));',
    function(err) {
      if (err) { throw err; }
      console.log('Done!');
      connection.end();
    }
  );
});
// [END all]
