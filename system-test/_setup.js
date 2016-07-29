// Copyright 2016, Google, Inc.
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

require('../test/_setup');

var assert = require('power-assert');
var sinon = require('sinon');

global.assert = assert;
global.sinon = sinon;

beforeEach(function () {
  assert(process.env.GCLOUD_PROJECT, 'Must set GCLOUD_PROJECT environment variable!');
  assert(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!');
});
