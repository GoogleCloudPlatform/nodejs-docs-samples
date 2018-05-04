/**
 * Copyright 2017, Google, Inc.
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

const {google} = require('googleapis');
const cloudtasks = google.cloudtasks('v2beta2');

/**
 * Create a task for a given queue with an arbitrary payload.
 */
async function createTask (project, location, queue, options) {
  // [START cloud_tasks_appengine_create_task]
  const authClient = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const task = {
    app_engine_http_request: {
      http_method: 'POST',
      relative_url: '/log_payload'
    }
  };

  if (options.payload !== undefined) {
    task.app_engine_http_request.payload = Buffer.from(options.payload).toString('base64');
  }

  if (options.inSeconds !== undefined) {
    task.schedule_time = (new Date(options.inSeconds * 1000 + Date.now())).toISOString();
  }

  const request = {
    parent: `projects/${project}/locations/${location}/queues/${queue}`, // TODO: Update placeholder value.
    resource: {
      task: task
    },
    auth: authClient
  };

  console.log('Sending task %j', task);

  const response = await cloudtasks.projects.locations.queues.tasks.create(request);
  console.log('Created task.', response.name);
  console.log(JSON.stringify(response, null, 2));
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
  createTask(opts.project, opts.location, opts.queue, opts).catch(console.error);
}

exports.createTask = createTask;
