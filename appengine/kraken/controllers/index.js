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

var IndexModel = require('../models/index');

// [START index]
module.exports = function (router) {
  var model = new IndexModel();

  router.get('/', function (req, res) {
    res.send('Hello ' + model.name + '! Kraken.js on Google App Engine.');
  });
};
// [END index]