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

var test = require('ava');
var async = require('async');

var tasks = require('../../datastore/tasks.js');
var taskIds = [];

test.after.cb.serial(function (t) {
  async.parallel(taskIds.map(function (taskId) {
    return function (cb) {
      tasks.deleteEntity(taskId, cb);
    };
  }), t.end);
});

test.cb.serial('should add a task', function (t) {
  getTaskId(t.end);
});

test.cb.serial('should mark a task as done', function (t) {
  getTaskId(function (err, taskId) {
    t.ifError(err);
    tasks.updateEntity(taskId, t.end);
  });
});

test.cb.serial('should list tasks', function (t) {
  tasks.retrieveEntities(t.end);
});

test.cb.serial('should delete a task', function (t) {
  getTaskId(function (err, taskId) {
    t.ifError(err);
    tasks.deleteEntity(taskId, t.end);
  });
});

test.cb.serial('should format tasks', function (t) {
  tasks.retrieveEntities(function (err, _tasks) {
    t.ifError(err);
    t.notThrows(function () {
      tasks.formatTasks(_tasks);
    });
    t.end();
  });
});

function getTaskId (callback) {
  tasks.addEntity('description', function (err, taskKey) {
    if (err) {
      return callback(err);
    }

    var taskId = taskKey.path.pop();
    taskIds.push(taskId);
    callback(null, taskId);
  });
}
