/**
 * Copyright 2016, Google, Inc.
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

// [START all]
// [START setup]
var moment = require('moment');
var google = require('googleapis').google;

// Instantiate a storage client
var storagetransfer = google.storagetransfer('v1');
// [END setup]

// [START auth]
function auth(callback) {
  google.auth.getApplicationDefault(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or GAE Flexible, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform',
      ]);
    }
    callback(null, authClient);
  });
}
// [END auth]

// [START create_transfer_job]
/**
 * Review the transfer operations associated with a transfer job.
 *
 * @param {object} options Configuration options.
 * @param {string} options.srcBucket The name of the source bucket.
 * @param {string} options.destBucket The name of the destination bucket.
 * @param {string} options.date The date of the first transfer in the format YYYY/MM/DD.
 * @param {string} options.time The time of the first transfer in the format HH:MM.
 * @param {string} [options.description] Optional. Description for the new transfer job.
 * @param {function} callback The callback function.
 */
function createTransferJob(options, callback) {
  var startDate = moment(options.date, 'YYYY/MM/DD');
  var transferTime = moment(options.time, 'HH:mm');

  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    var transferJob = {
      projectId: process.env.GCLOUD_PROJECT,
      status: 'ENABLED',
      transferSpec: {
        gcsDataSource: {
          bucketName: options.srcBucket,
        },
        gcsDataSink: {
          bucketName: options.destBucket,
        },
        transferOptions: {
          deleteObjectsFromSourceAfterTransfer: false,
        },
      },
      schedule: {
        scheduleStartDate: {
          year: startDate.year(),
          month: startDate.month() + 1,
          day: startDate.date(),
        },
        startTimeOfDay: {
          hours: transferTime.hours(),
          minutes: transferTime.minutes(),
        },
      },
    };

    if (options.description) {
      transferJob.description = options.description;
    }

    storagetransfer.transferJobs.create(
      {
        auth: authClient,
        resource: transferJob,
      },
      function(err, response) {
        if (err) {
          return callback(err);
        }

        const transferJob = response.data;
        console.log('Created transfer job: %s', transferJob.name);
        return callback(null, transferJob);
      }
    );
  });
}
// [END create_transfer_job]

// [START get_transfer_job]
/**
 * Get a transfer job.
 *
 * @param {string} jobName The name of the transfer job to get.
 * @param {function} callback The callback function.
 */
function getTransferJob(jobName, callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferJobs.get(
      {
        auth: authClient,
        projectId: process.env.GCLOUD_PROJECT,
        jobName: jobName,
      },
      function(err, response) {
        if (err) {
          return callback(err);
        }

        const transferJob = response.data;
        console.log('Found transfer job: %s', transferJob.name);
        return callback(null, transferJob);
      }
    );
  });
}
// [END get_transfer_job]

// [START update_transfer_job]
/**
 * Get a transfer job.
 *
 * @param {object} options Configuration options.
 * @param {string} options.job The name of the transfer job to get.
 * @param {string} options.field The field to update. Can be description, status, or transferSpec.
 * @param {string} options.value The new value for the field.
 * @param {function} callback The callback function.
 */
function updateTransferJob(options, callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    var patchRequest = {
      projectId: process.env.GCLOUD_PROJECT,
      transferJob: {
        name: options.job,
      },
      updateTransferJobFieldMask: options.field,
    };

    if (options.field === 'description') {
      patchRequest.transferJob.description = options.value;
    } else if (options.field === 'status') {
      patchRequest.transferJob.status = options.value;
    } else if (options.field === 'transferSpec') {
      patchRequest.transferJob.transferSpec = JSON.parse(options.value);
    }

    storagetransfer.transferJobs.patch(
      {
        auth: authClient,
        jobName: options.job,
        resource: patchRequest,
      },
      function(err, response) {
        if (err) {
          return callback(err);
        }

        const transferJob = response.data;
        console.log('Updated transfer job: %s', transferJob.name);
        return callback(null, transferJob);
      }
    );
  });
}
// [END update_transfer_job]

// [START list_transfer_jobs]
/**
 * List transfer jobs for the authenticated project.
 *
 * @param {function} callback The callback function.
 */
function listTransferJobs(callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferJobs.list(
      {
        auth: authClient,
        filter: JSON.stringify({project_id: process.env.GCLOUD_PROJECT}),
      },
      function(err, response) {
        if (err) {
          return callback(err);
        } else if (!response.data || !response.data.transferJobs) {
          return callback(null, []);
        }

        console.log('Found %d jobs!', response.data.transferJobs.length);
        return callback(null, response.data.transferJobs);
      }
    );
  });
}
// [END list_transfer_jobs]

// [START list_transfer_operations]
/**
 * List transfer operations in the authenticated project.
 *
 * @param {string} [jobName] An optional job name by which to filter results.
 * @param {function} callback The callback function.
 */
function listTransferOperations(jobName, callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    var filter = {
      project_id: process.env.GCLOUD_PROJECT,
    };

    if (jobName) {
      filter.job_names = [jobName];
    }

    storagetransfer.transferOperations.list(
      {
        name: 'transferOperations',
        filter: JSON.stringify(filter),
        auth: authClient,
      },
      function(err, response) {
        if (err) {
          return callback(err);
        } else if (!response.data || !response.data.operations) {
          return callback(null, []);
        }

        console.log('Found %d operations!', response.data.operations.length);
        return callback(null, response.data.operations);
      }
    );
  });
}
// [END list_transfer_operations]

// [START get_transfer_operation]
/**
 * Get the specified transfer operation.
 *
 * @param {string} transferOperationName The name of the transfer operation.
 * @param {function} callback The callback function.
 */
function getTransferOperation(transferOperationName, callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferOperations.get(
      {
        name: transferOperationName,
        auth: authClient,
      },
      function(err, response) {
        if (err) {
          return callback(err);
        }

        const transferOperation = response.data;
        console.log('Found transfer operation: %s', transferOperation);
        return callback(null, transferOperation);
      }
    );
  });
}
// [END get_transfer_operation]

// [START pause_transfer_operation]
/**
 * Pause the specified transfer operation.
 *
 * @param {string} transferOperationName The name of the transfer operation.
 * @param {function} callback The callback function.
 */
function pauseTransferOperation(transferOperationName, callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferOperations.pause(
      {
        name: transferOperationName,
        auth: authClient,
      },
      function(err) {
        if (err) {
          return callback(err);
        }

        console.log('Paused transfer operation: %s', transferOperationName);
        return callback(null);
      }
    );
  });
}
// [END pause_transfer_operation]

// [START resume_transfer_operation]
/**
 * Pause the specified transfer operation.
 *
 * @param {string} transferOperationName The name of the transfer operation.
 * @param {function} callback The callback function.
 */
function resumeTransferOperation(transferOperationName, callback) {
  auth(function(err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferOperations.resume(
      {
        name: transferOperationName,
        auth: authClient,
      },
      function(err) {
        if (err) {
          return callback(err);
        }

        console.log('Resumed transfer operation: %s', transferOperationName);
        return callback(null);
      }
    );
  });
}
// [END resume_transfer_operation]
// [END all]

// The command-line program
var cli = require('yargs');

var program = (module.exports = {
  createTransferJob: createTransferJob,
  getTransferJob: getTransferJob,
  listTransferJobs: listTransferJobs,
  updateTransferJob: updateTransferJob,
  listTransferOperations: listTransferOperations,
  getTransferOperation: getTransferOperation,
  pauseTransferOperation: pauseTransferOperation,
  resumeTransferOperation: resumeTransferOperation,
  main: function(args) {
    // Run the command-line program
    cli.help().strict().parse(args).argv; // eslint-disable-line
  },
});

cli
  .demand(1)
  .command(
    'jobs <cmd> [args]',
    'Run a job command.',
    yargs => {
      yargs
        .demand(2)
        .command(
          'create <srcBucket> <destBucket> <time> <date> [description]',
          'Create a transfer job.',
          {},
          opts => {
            program.createTransferJob(
              {
                srcBucket: opts.srcBucket,
                destBucket: opts.destBucket,
                time: opts.time,
                date: opts.date,
                description: opts.description,
              },
              console.log
            );
          }
        )
        .command('get <job>', 'Get a transfer job.', {}, opts => {
          program.getTransferJob(opts.job, console.log);
        })
        .command('list', 'List transfer jobs.', {}, () => {
          program.listTransferJobs(console.log);
        })
        .command(
          'set <job> <field> <value>',
          'Change the status, description or transferSpec of a transfer job.',
          {},
          opts => {
            program.updateTransferJob(
              {
                job: opts.job,
                field: opts.field,
                value: opts.value,
              },
              console.log
            );
          }
        )
        .example(
          'node $0 jobs create my-bucket my-other-bucket 2016/08/12 16:30 "Move my files"',
          'Create a transfer job.'
        )
        .example(
          'node $0 jobs get transferJobs/123456789012345678',
          'Get a transfer job.'
        )
        .example('node $0 jobs list', 'List transfer jobs.')
        .example(
          'node $0 jobs set transferJobs/123456789012345678 description "My new description"',
          'Update the description for a transfer job.'
        )
        .example(
          'node $0 jobs set transferJobs/123456789012345678 status DISABLED',
          'Disable a transfer job.'
        )
        .wrap(100);
    },
    () => {}
  )
  .command(
    'operations <cmd> [args]',
    'Run an operation command.',
    yargs => {
      yargs
        .demand(2)
        .command(
          'list [job]',
          'List transfer operations, optionally filtering by a job name.',
          {},
          opts => {
            program.listTransferOperations(opts.job, console.log);
          }
        )
        .command('get <operation>', 'Get a transfer operation.', {}, opts => {
          program.getTransferOperation(opts.operation, console.log);
        })
        .command(
          'pause <operation>',
          'Pause a transfer operation.',
          {},
          opts => {
            program.pauseTransferOperation(opts.operation, console.log);
          }
        )
        .command(
          'resume <operation>',
          'Resume a transfer operation.',
          {},
          opts => {
            program.resumeTransferOperation(opts.operation, console.log);
          }
        )
        .example('node $0 operations list', 'List all transfer operations.')
        .example(
          'node $0 operations list transferJobs/123456789012345678',
          'List all transfer operations for a specific job.'
        )
        .example(
          'node $0 operations get transferOperations/123456789012345678',
          'Get a transfer operation.'
        )
        .example(
          'node $0 operations pause transferOperations/123456789012345678',
          'Pause a transfer operation.'
        )
        .example(
          'node $0 operations resume transferOperations/123456789012345678',
          'Resume a transfer operation.'
        )
        .wrap(100);
    },
    () => {}
  )
  .example('node $0 jobs --help', 'Show job commands.')
  .example('node $0 operations --help', 'Show operations commands.')
  .wrap(100)
  .recommendCommands()
  .epilogue(
    'For more information, see https://cloud.google.com/storage/transfer'
  );

if (module === require.main) {
  program.main(process.argv.slice(2));
}
