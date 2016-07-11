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

var input = process.argv.splice(2);
var command = input.shift();

if (!process.env.GCLOUD_PROJECT) {
  throw new Error('GCLOUD_PROJECT environment variable required.');
}

// [START build_service]
// By default, gcloud will authenticate using the service account file specified
// by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use the
// project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/guides/authentication
var gcloud = require('gcloud');
var datastore = gcloud.datastore();
// [END build_service]

/*
Installation and setup instructions.
1. Download the TaskList sample application from [here]
(https://github.com/GoogleCloudPlatform/nodejs-docs-samples/archive/master.zip).

2. Unzip the download:
```sh
unzip nodejs-docs-samples-master.zip
```

3. Change directories to the TaskList application:
```sh
cd nodejs-docs-samples-master/datastore
```

4. Install the dependencies and link the application:
```sh
npm install
```

5. With the gcloud SDK, be sure you are authenticated:
```sh
gcloud auth login
```

6. At a command prompt, run the following, where `<project-id>` is the ID of
your Google Cloud Platform project.
```sh
export GCLOUD_PROJECT=<project-id>
```

7. Run the application!
```sh
npm run tasks
```
*/

// [START add_entity]
function addTask (description, callback) {
  var taskKey = datastore.key('Task');

  datastore.save({
    key: taskKey,
    data:  [
      {
        name: 'created',
        value: new Date().toJSON()
      },
      {
        name: 'description',
        value: description,
        excludeFromIndexes: true
      },
      {
        name: 'done',
        value: false
      }
    ]
  }, function (err) {
    if (err) {
      callback(err);
      return;
    }

    callback(null, taskKey);
  });
}
// [END add_entity]

// [START update_entity]
function markDone (taskId, callback) {
  var error;

  datastore.runInTransaction(function (transaction, done) {
    var taskKey = datastore.key([
      'Task',
      taskId
    ]);

    transaction.get(taskKey, function (err, task) {
      if (err) {
        // An error occurred while getting the values.
        error = err;
        transaction.rollback(done);
        return;
      }

      task.data.done = true;

      transaction.save(task);

      // Commit the transaction.
      done();
    });
  }, function (transactionError) {
    if (transactionError || error) {
      return callback(transactionError || error);
    }
    // The transaction completed successfully.
    callback();
  });
}
// [END update_entity]

// [START retrieve_entities]
function listTasks (callback) {
  var query = datastore.createQuery('Task')
    .order('created');

  datastore.runQuery(query, callback);
}
// [END retrieve_entities]

// [START delete_entity]
function deleteTask (taskId, callback) {
  var taskKey = datastore.key([
    'Task',
    taskId
  ]);

  datastore.delete(taskKey, callback);
}
// [END delete_entity]

// [START format_results]
function formatTasks (tasks) {
  return tasks
    .map(function (task) {
      var taskKey = task.key.path.pop();
      var status;

      if (task.data.done) {
        status = 'done';
      } else {
        status = 'created ' + new Date(task.data.created);
      }

      return taskKey + ' : ' + task.data.description + ' (' + status + ')';
    })
    .join('\n');
}
// [END format_results]

if (module === require.main) {
  var taskId;

  switch (command) {
    case 'new': {
      addTask(input, function (err, taskKey) {
        if (err) {
          throw err;
        }

        taskId = taskKey.path.pop();

        console.log('Task %d created successfully.', taskId);
      });

      break;
    }
    case 'done': {
      taskId = parseInt(input, 10);

      markDone(taskId, function (err) {
        if (err) {
          throw err;
        }

        console.log('Task %d updated successfully.', taskId);
      });

      break;
    }
    case 'list': {
      listTasks(function (err, tasks) {
        if (err) {
          throw err;
        }

        console.log(formatTasks(tasks));
      });

      break;
    }
    case 'delete': {
      taskId = parseInt(input, 10);

      deleteTask(taskId, function (err) {
        if (err) {
          throw err;
        }

        console.log('Task %d deleted successfully.', taskId);
      });

      break;
    }
    default: {
      // Only print usage if this file is being executed directly
      if (module === require.main) {
        console.log([
          'Usage:',
          '',
          '  new <description> Adds a task with a description <description>',
          '  done <task-id>    Marks a task as done',
          '  list              Lists all tasks by creation time',
          '  delete <task-id>  Deletes a task'
        ].join('\n'));
      }
    }
  }
}

module.exports.addEntity = addTask;
module.exports.updateEntity = markDone;
module.exports.retrieveEntities = listTasks;
module.exports.deleteEntity = deleteTask;
module.exports.formatTasks = formatTasks;
