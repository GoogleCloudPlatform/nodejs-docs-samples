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

// [START all]
// [START setup]
var moment = require('moment');
var google = require('googleapis');

// Instantiate a storage client
var storagetransfer = google.storagetransfer('v1');
// [END setup]

// [START auth]
function auth (callback) {
  google.auth.getApplicationDefault(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    // The createScopedRequired method returns true when running on GAE or a
    // local developer machine. In that case, the desired scopes must be passed
    // in manually. When the code is  running in GCE or a Managed VM, the scopes
    // are pulled from the GCE metadata server.
    // See https://cloud.google.com/compute/docs/authentication for more
    // information.
    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      // Scopes can be specified either as an array or as a single,
      // space-delimited string.
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/cloud-platform'
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
 * @param {string} srcBucketName The name of the source bucket.
 * @param {string} destBucketName The name of the destination bucket.
 * @param {string} [description] Optional description for the new transfer job.
 * @param {function} callback The callback function.
 */
function createTransferJob (srcBucketName, destBucketName, date, time, description, callback) {
  if (!srcBucketName) {
    return callback(new Error('"srcBucketName" is required!'));
  } else if (!destBucketName) {
    return callback(new Error('"destBucketName" is required!'));
  }

  var startDate = moment(date, 'YYYY/MM/DD');
  var transferTime = moment(time, 'HH:mm');

  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    var transferJob = {
      projectId: process.env.GCLOUD_PROJECT,
      status: 'ENABLED',
      transferSpec: {
        gcsDataSource: {
          bucketName: srcBucketName
        },
        gcsDataSink: {
          bucketName: destBucketName
        },
        transferOptions: {
          deleteObjectsFromSourceAfterTransfer: false
        }
      },
      schedule: {
        scheduleStartDate: {
          year: startDate.year(),
          month: startDate.month() + 1,
          day: startDate.date()
        },
        startTimeOfDay: {
          hours: transferTime.hours(),
          minutes: transferTime.minutes()
        }
      }
    };

    if (description) {
      transferJob.description = description;
    }

    storagetransfer.transferJobs.create({
      auth: authClient,
      resource: transferJob
    }, function (err, transferJob) {
      if (err) {
        return callback(err);
      }

      console.log('Created transfer job: %s', transferJob.name);
      return callback(null, transferJob);
    });
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
function getTransferJob (jobName, callback) {
  if (!jobName) {
    return callback(new Error('"jobName" is required!'));
  }

  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferJobs.get({
      auth: authClient,
      projectId: process.env.GCLOUD_PROJECT,
      jobName: jobName
    }, function (err, transferJob) {
      if (err) {
        return callback(err);
      }

      console.log('Found transfer job: %s', transferJob.name);
      return callback(null, transferJob);
    });
  });
}
// [END get_transfer_job]

// [START update_transfer_job]
/**
 * Get a transfer job.
 *
 * @param {string} jobName The name of the transfer job to get.
 * @param {string} field The field to update. Can be description, status, or transferSpec.
 * @param {string} value The new value for the field.
 * @param {function} callback The callback function.
 */
function updateTransferJob (jobName, field, value, callback) {
  if (!jobName) {
    return callback(new Error('"jobName" is required!'));
  } else if (!field) {
    return callback(new Error('"field" is required!'));
  } else if (!value) {
    return callback(new Error('"value" is required!'));
  }

  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    var patchRequest = {
      projectId: process.env.GCLOUD_PROJECT,
      transferJob: {
        name: jobName
      },
      updateTransferJobFieldMask: field
    };

    if (field === 'description') {
      patchRequest.transferJob.description = value;
    } else if (field === 'status') {
      patchRequest.transferJob.status = value;
    } else if (field === 'transferSpec') {
      patchRequest.transferJob.transferSpec = JSON.parse(value);
    }

    storagetransfer.transferJobs.patch({
      auth: authClient,
      jobName: jobName,
      resource: patchRequest
    }, function (err, transferJob) {
      if (err) {
        return callback(err);
      }

      console.log('Updated transfer job: %s', transferJob.name);
      return callback(null, transferJob);
    });
  });
}
// [END update_transfer_job]

// [START list_transfer_jobs]
/**
 * List transfer jobs for the authenticated project.
 *
 * @param {function} callback The callback function.
 */
function listTransferJobs (callback) {
  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferJobs.list({
      auth: authClient,
      filter: JSON.stringify({ project_id: process.env.GCLOUD_PROJECT })
    }, function (err, result) {
      if (err) {
        return callback(err);
      } else if (!result.transferJobs) {
        return callback(null, []);
      }

      console.log('Found %d jobs!', result.transferJobs.length);
      return callback(null, result.transferJobs);
    });
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
function listTransferOperations (jobName, callback) {
  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    var filter = {
      project_id: process.env.GCLOUD_PROJECT
    };

    if (jobName) {
      filter.job_names = [jobName];
    }

    storagetransfer.transferOperations.list({
      name: 'transferOperations',
      filter: JSON.stringify(filter),
      auth: authClient
    }, function (err, result, apiResponse) {
      if (err) {
        return callback(err);
      } else if (!result.operations) {
        return callback(null, []);
      }

      console.log('Found %d operations!', result.operations.length);
      return callback(null, result.operations);
    });
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
function getTransferOperation (transferOperationName, callback) {
  if (!transferOperationName) {
    return callback(new Error('"transferOperationName" is required!'));
  }

  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferOperations.get({
      name: transferOperationName,
      auth: authClient
    }, function (err, transferOperation) {
      if (err) {
        return callback(err);
      }

      console.log('Found transfer operation: %s', transferOperation);
      return callback(null, transferOperation);
    });
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
function pauseTransferOperation (transferOperationName, callback) {
  if (!transferOperationName) {
    return callback(new Error('"transferOperationName" is required!'));
  }

  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferOperations.pause({
      name: transferOperationName,
      auth: authClient
    }, function (err) {
      if (err) {
        return callback(err);
      }

      console.log('Paused transfer operation: %s', transferOperationName);
      return callback(null);
    });
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
function resumeTransferOperation (transferOperationName, callback) {
  if (!transferOperationName) {
    return callback(new Error('"transferOperationName" is required!'));
  }

  auth(function (err, authClient) {
    if (err) {
      return callback(err);
    }

    storagetransfer.transferOperations.resume({
      name: transferOperationName,
      auth: authClient
    }, function (err) {
      if (err) {
        return callback(err);
      }

      console.log('Resumed transfer operation: %s', transferOperationName);
      return callback(null);
    });
  });
}
// [END resume_transfer_operation]

// [START usage]
function printUsage () {
  console.log('Usage: node encryption RESOURCE COMMAND [ARGS...]');
  console.log('\nResources:\n');
  console.log('    jobs');
  console.log('\n\tCommands:\n');
  console.log('\t\tcreate SRC_BUCKET_NAME DEST_BUCKET_NAME DATE TIME [DESCRIPTION]');
  console.log('\t\tget JOB_NAME');
  console.log('\t\tlist');
  console.log('\t\tset JOB_NAME FIELD VALUE');
  console.log('\n    operations');
  console.log('\n\tCommands:\n');
  console.log('\t\tlist [JOB_NAME]');
  console.log('\t\tget TRANSFER_NAME');
  console.log('\t\tpause TRANSFER_NAME');
  console.log('\t\tresume TRANSFER_NAME');
  console.log('\nExamples:\n');
  console.log('\tnode transfer jobs create my-bucket my-other-bucket 2016/08/12 16:30 "Move my files"');
  console.log('\tnode transfer jobs get transferJobs/123456789012345678');
  console.log('\tnode transfer jobs list');
  console.log('\tnode transfer jobs set transferJobs/123456789012345678 description "My new description"');
  console.log('\tnode transfer jobs set transferJobs/123456789012345678 status DISABLED');
  console.log('\tnode transfer operations list');
  console.log('\tnode transfer operations list transferJobs/123456789012345678');
  console.log('\tnode transfer operations get transferOperations/123456789012345678');
  console.log('\tnode transfer operations pause transferOperations/123456789012345678');
  console.log('\tnode transfer operations resume transferOperations/123456789012345678');
}
// [END usage]

// The command-line program
var program = {
  createTransferJob: createTransferJob,
  getTransferJob: getTransferJob,
  listTransferJobs: listTransferJobs,
  updateTransferJob: updateTransferJob,
  listTransferOperations: listTransferOperations,
  getTransferOperation: getTransferOperation,
  pauseTransferOperation: pauseTransferOperation,
  resumeTransferOperation: resumeTransferOperation,
  printUsage: printUsage,

  // Executed when this program is run from the command-line
  main: function (args, cb) {
    var resource = args.shift();
    var command = args.shift();
    if (resource === 'jobs') {
      if (command === 'create') {
        this.createTransferJob(args[0], args[1], args[2], args[3], args[4], cb);
      } else if (command === 'get') {
        this.getTransferJob(args[0], cb);
      } else if (command === 'list') {
        this.listTransferJobs(cb);
      } else if (command === 'set') {
        this.updateTransferJob(args[0], args[1], args[2], cb);
      } else {
        this.printUsage();
      }
    } else if (resource === 'operations') {
      if (command === 'list') {
        this.listTransferOperations(args[0], cb);
      } else if (command === 'get') {
        this.getTransferOperation(args[0], cb);
      } else if (command === 'pause') {
        this.pauseTransferOperation(args[0], cb);
      } else if (command === 'resume') {
        this.resumeTransferOperation(args[0], cb);
      } else {
        this.printUsage();
      }
    } else {
      this.printUsage();
    }
  }
};

if (module === require.main) {
  program.main(process.argv.slice(2), console.log);
}
// [END all]

module.exports = program;
