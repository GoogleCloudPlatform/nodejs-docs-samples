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

var program = require('../projects');

describe('resource:projects', function () {
  describe('list', function () {
    it('should list projects', function (done) {
      program.listProjects(function (err, projects) {
        assert.ifError(err);
        assert(Array.isArray(projects));
        assert(projects.length > 0);
        assert(console.log.calledWith('Found %d project(s)!', projects.length));
        setTimeout(done, 2000);
      });
    });
  });
});
