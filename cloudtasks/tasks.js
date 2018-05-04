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

async function createTask (project, location, queue) {
  // [START cloud_tasks_create_task]
  const {google} = require('googleapis');
  const cloudtasks = google.cloudtasks('v2beta2');

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const project = 'Project ID, e.g. my-project-id';
  // const location = 'Location of queue, e.g. us-central1';
  // const queue = 'Queue ID, e.g. queue-1';

  const authClient = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  // Schedule the task for 2 minutes from now
  const scheduleTime = new Date();
  scheduleTime.setUTCMinutes(scheduleTime.getUTCMinutes() + 2);

  const task = {
    scheduleTime: scheduleTime,
    pull_message: {
      payload: Buffer.from('a message for the recipient').toString('base64')
    }
  };

  const request = {
    parent: `projects/${project}/locations/${location}/queues/${queue}`,
    resource: {
      task: task
    },
    auth: authClient
  };

  const response = await cloudtasks.projects.locations.queues.tasks.create(request);
  console.log(`Created task ${response.data.name}.`);
  console.log(JSON.stringify(response.data, null, 2));
  // [END cloud_tasks_create_task]
}

async function pullTask (project, location, queue) {
  // [START cloud_tasks_pull_and_acknowledge_task]
  const {google} = require('googleapis');
  const cloudtasks = google.cloudtasks('v2beta2');

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const project = 'Project ID, e.g. my-project-id';
  // const location = 'Location of queue, e.g. us-central1';
  // const queue = 'Queue ID, e.g. queue-1';

  const authClient = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const request = {
    parent: `projects/${project}/locations/${location}/queues/${queue}`,
    responseView: 'FULL',
    pageSize: 1,
    auth: authClient
  };

  const response = await cloudtasks.projects.locations.queues.tasks.list(request);
  const task = response.data.tasks[0];
  console.log('Pulled task %j', task);
}

async function acknowledgeTask (task) {
  const {google} = require('googleapis');
  const cloudtasks = google.cloudtasks('v2beta2');

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const task = {
  //   name: 'projects/YOUR_PROJECT_ID/locations/us-central1/queues/YOUR_QUEUE_ID/tasks/YOUR_TASK_ID,
  //   scheduleTime: '2017-11-01T21:02:28.994Z' // TODO(developer): set this to your task's scheduled time
  // };

  const authClient = await google.auth.getClient({
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const request = {
    name: task.name,
    scheduleTime: task.scheduleTime,
    auth: authClient
  };

  await cloudtasks.projects.locations.queues.tasks.acknowledge(request);
  console.log(`Acknowledged task ${task.name}.`);
  // [END cloud_tasks_pull_and_acknowledge_task]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `create <project> <location> <queue>`,
    `Create a task.`,
    {},
    (opts) => createTask(opts.project, opts.location, opts.queue).catch(console.error)
  )
  .command(
    `pull <project> <location> <queue>`,
    `Pull a task.`,
    {},
    (opts) => pullTask(opts.project, opts.location, opts.queue).catch(console.error)
  )
  .command(
    `acknowledge <task>`,
    `Acknowledge a task.`,
    {},
    (opts) => acknowledgeTask(JSON.parse(opts.task)).catch(console.error)
  )
  .example(`node $0 create my-project-id us-central1 my-queue`)
  .example(`node $0 pull my-project-id us-central1 my-queue`)
  .example(`node $0 acknowledge '{"name":"projects/my-project-id/locations/us-central1/queues/my-queue/tasks/1234","scheduleTime":"2017-11-01T22:27:53.628279Z"}'`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/cloud-tasks/docs`)
  .help()
  .strict().argv;
