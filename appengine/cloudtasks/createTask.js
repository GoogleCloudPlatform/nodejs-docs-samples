/**
* Copyright 2018, Google, Inc.
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

/**
* Create a task for a given queue with an arbitrary payload.
*/
function createTask (project, location, queue, options) {
  // [START cloud_tasks_appengine_create_task]
  // Imports the Google Cloud Tasks library.
  const cloudTasks = require('@google-cloud/tasks');

  // Instantiates a client.
  const client = new cloudTasks.CloudTasksClient();

  // Construct the fully qualified queue name.
  const parent = client.queuePath(project, location, queue);

  const task = {
    appEngineHttpRequest: {
      httpMethod: 'POST',
      relativeUrl: '/log_payload'
    }
  };

  if (options.payload !== undefined) {
    task.appEngineHttpRequest.payload = Buffer.from(options.payload).toString('base64');
  }

  if (options.inSeconds !== undefined) {
    task.scheduleTime = {
      seconds: (options.inSeconds + Date.now() / 1000)
    };
  }

  const request = {
    parent: parent,
    task: task
  };

  console.log('Sending task %j', task);
  // Send create task request.
  client.createTask(request).then(response => {
    const task = response[0].name;
    console.log(`Created task ${task}`);
  }).catch(err => {
    console.error(`Error in createTask: ${err.message || err}`);
  });
  // [END cloud_tasks_appengine_create_task]
}

const cli = require(`yargs`)
  .options({
    location: {
      alias: 'l',
      description: 'Location of the queue to add the task to.',
      type: 'string',
      requiresArg: true,
      required: true
    },
    queue: {
      alias: 'q',
      description: 'ID (short name) of the queue to add the task to.',
      type: 'string',
      requiresArg: true,
      required: true
    },
    project: {
      alias: 'p',
      description: 'Project of the queue to add the task to.',
      default: process.env.GCLOUD_PROJECT,
      type: 'string',
      requiresArg: true,
      required: true
    },
    payload: {
      alias: 'd',
      description: '(Optional) Payload to attach to the push queue.',
      type: 'string',
      requiresArg: true
    },
    inSeconds: {
      alias: 's',
      description: '(Optional) The number of seconds from now to schedule task attempt.',
      type: 'number',
      requiresArg: true
    }
  })
  .example(`node $0 --project my-project-id`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/cloud-tasks`)
  .strict();

if (module === require.main) {
  const opts = cli.help().parse(process.argv.slice(2));
  process.env.GCLOUD_PROJECT = opts.project;
  createTask(opts.project, opts.location, opts.queue, opts);
}

exports.createTask = createTask;
