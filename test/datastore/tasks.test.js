// Copyright 2015, Google, Inc.
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

var assert = require('assert');

var tasks = require('../../datastore/tasks.js');

describe('adding an entity', function() {
  it('should add a task', function(done) {
    tasks.addEntity('description', done);
  });
});

describe('updating an entity', function() {
  var taskId;

  before(function(done) {
    getTaskId(function(err, _taskId) {
      if (err) {
        done(err);
        return;
      }

      taskId = _taskId;
      done();
    });
  });

  it('should mark a task as done', function(done) {
    tasks.updateEntity(taskId, done);
  });
});

describe('retrieving entities', function() {
  it('should list tasks', function(done) {
    tasks.retrieveEntities(done);
  });
});

describe('deleting an entity', function() {
  var taskId;

  before(function(done) {
    getTaskId(function(err, _taskId) {
      if (err) {
        done(err);
        return;
      }

      taskId = _taskId;
      done();
    });
  });

  it('should delete a task', function(done) {
    tasks.deleteEntity(taskId, done);
  });
});

describe('formatting results', function() {
  var tasks;

  before(function(done) {
    tasks.retrieveEntities(function(err, _tasks) {
      if (err) {
        done(err);
        return;
      }

      tasks = _tasks;
      done();
    });
  });

  it('should format tasks', function() {
    assert.doesNotThrow(function() {
      tasks.formatResults(tasks);
    });
  });
});

function getTaskId(callback) {
  tasks.addEntity('description', function(err, taskKey) {
    if (err) {
      callback(err);
      return;
    }

    var taskId = taskKey.path.pop();
    callback(null, taskId);
  });
}
