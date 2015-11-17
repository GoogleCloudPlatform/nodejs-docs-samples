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
var async = require('async');

var tasks = require('../../datastore/tasks.js');
var taskIds = [];

describe('datastore/tasks/', function() {

  after(function (done) {
    async.parallel(taskIds.map(function(taskId) {
      return function (cb) {
        tasks.deleteEntity(taskId, cb);
      };
    }), done);
  });

  describe('adding an entity', function() {
    it('should add a task', function(done) {
      getTaskId(done);
    });
  });

  describe('updating an entity', function() {
    it('should mark a task as done', function(done) {
      getTaskId(function (err, taskId) {
        if (err) {
          return done(err);
        }
        tasks.updateEntity(taskId, done);
      });
    });
  });

  describe('retrieving entities', function() {
    it('should list tasks', function(done) {
      tasks.retrieveEntities(done);
    });
  });

  describe('deleting an entity', function() {
    it('should delete a task', function(done) {
      getTaskId(function (err, taskId) {
        if (err) {
          return done(err);
        }
        tasks.deleteEntity(taskId, done);
      });
    });
  });

  describe('formatting results', function() {
    it('should format tasks', function(done) {
      tasks.retrieveEntities(function(err, _tasks) {
        if (err) {
          done(err);
          return;
        }

        try {
          assert.doesNotThrow(function() {
            tasks.formatTasks(_tasks);
          });
          done();
        } catch (err) {
          done(err);
        }
      });
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
    taskIds.push(taskId);
    callback(null, taskId);
  });
}
