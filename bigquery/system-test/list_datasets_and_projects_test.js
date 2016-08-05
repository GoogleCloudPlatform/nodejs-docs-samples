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

var listDatasetsAndProjectsExample = require("../list_datasets_and_projects")

describe('bigquery:list_datasets_and_projects', function () {
  it('should be tested');

  it('should list datasets', function () {
    listDatasetsAndProjectsExample.main("googledata", function(datasets) {
      assert.notNull(datasets)
      assert.notEqual(len(datasets), 0)
    })
  });

  it('should list projects', function () {
    listDatasetsAndProjectsExample.main(null, function(projects) {
      assert.notNull(projects)
      assert.notEqual(len(projects), 0)
    })
  });

});
