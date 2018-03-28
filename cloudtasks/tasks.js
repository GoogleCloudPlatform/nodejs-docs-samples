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

function createTask (project, location, queue) {
  // [START cloud_tasks_create_task]
  const google = require('googleapis').google;
  const cloudtasks = google.cloudtasks('v2beta2');

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const project = 'Project ID, e.g. my-project-id';
  // const location = 'Location of queue, e.g. us-central1';
  // const queue = 'Queue ID, e.g. queue-1';

  authorize((authClient) => {
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

    cloudtasks.projects.locations.queues.tasks.create(request, (err, response) => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }

      console.log(`Created task ${response.data.name}.`);
      console.log(JSON.stringify(response.data, null, 2));
    });
  });

  function authorize (callback) {
    google.auth.getApplicationDefault(function (err, authClient) {
      if (err) {
        console.error('authentication failed: ', err);
        return;
      }
      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
        authClient = authClient.createScoped(scopes);
      }
      callback(authClient);
    });
  }
  // [END cloud_tasks_create_task]
}

function pullTask (project, location, queue) {
  // [START cloud_tasks_pull_and_acknowledge_task]
  const google = require('googleapis').google;
  const cloudtasks = google.cloudtasks('v2beta2');

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const project = 'Project ID, e.g. my-project-id';
  // const location = 'Location of queue, e.g. us-central1';
  // const queue = 'Queue ID, e.g. queue-1';

  authorize((authClient) => {
    const request = {
      parent: `projects/${project}/locations/${location}/queues/${queue}`,
      responseView: 'FULL',
      pageSize: 1,
      auth: authClient
    };

    cloudtasks.projects.locations.queues.tasks.list(request, (err, response) => {
      if (err) {
        console.error(err);
        return;
      }

      const task = response.data.tasks[0];
      console.log('Pulled task %j', task);
    });
  });

  function authorize (callback) {
    google.auth.getApplicationDefault(function (err, authClient) {
      if (err) {
        console.error('authentication failed: ', err);
        return;
      }
      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
        authClient = authClient.createScoped(scopes);
      }
      callback(authClient);
    });
  }
}

function acknowledgeTask (task) {
  const google = require('googleapis').google;
  const cloudtasks = google.cloudtasks('v2beta2');

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const task = {
  //   name: 'projects/YOUR_PROJECT_ID/locations/us-central1/queues/YOUR_QUEUE_ID/tasks/YOUR_TASK_ID,
  //   scheduleTime: '2017-11-01T21:02:28.994Z'
  // };

  authorize((authClient) => {
    const request = {
      name: task.name,
      scheduleTime: task.scheduleTime,
      auth: authClient
    };

    cloudtasks.projects.locations.queues.tasks.acknowledge(request, (err, response) => {
      if (err) {
        console.error(err);
        return;
      }

      console.log(`Acknowledged task ${task.name}.`);
    });
  });

  function authorize (callback) {
    google.auth.getApplicationDefault(function (err, authClient) {
      if (err) {
        console.error('authentication failed: ', err);
        return;
      }
      if (authClient.createScopedRequired && authClient.createScopedRequired()) {
        var scopes = ['https://www.googleapis.com/auth/cloud-platform'];
        authClient = authClient.createScoped(scopes);
      }
      callback(authClient);
    });
  }
  // [END cloud_tasks_pull_and_acknowledge_task]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `create <project> <location> <queue>`,
    `Create a task.`,
    {},
    (opts) => createTask(opts.project, opts.location, opts.queue)
  )
  .command(
    `pull <project> <location> <queue>`,
    `Pull a task.`,
    {},
    (opts) => pullTask(opts.project, opts.location, opts.queue)
  )
  .command(
    `acknowledge <task>`,
    `Acknowledge a task.`,
    {},
    (opts) => acknowledgeTask(JSON.parse(opts.task))
  )
  .example(`node $0 create my-project-id us-central1 my-queue`)
  .example(`node $0 pull my-project-id us-central1 my-queue`)
  .example(`node $0 acknowledge '{"name":"projects/my-project-id/locations/us-central1/queues/my-queue/tasks/1234","scheduleTime":"2017-11-01T22:27:53.628279Z"}'`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/cloud-tasks/docs`)
  .help()
  .strict().argv;
