/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const assert = require('assert');
const {describe, it} = require('mocha');
const {BatchServiceClient} = require('@google-cloud/batch').v1;
const {
  callCreateBatchNotifications,
} = require('../create/create_batch_notifications');
const {deleteJob, getJob} = require('./batchClient_operations');
const batchClient = new BatchServiceClient();

describe('Create batch notifications', async () => {
  const jobName = 'job-name-batch-notifications';
  const region = 'europe-central2';
  const topicId = 'topic-id';

  let projectId;

  before(async () => {
    projectId = await batchClient.getProjectId();
  });

  after(async () => {
    await deleteJob(batchClient, projectId, region, jobName);
  });

  it('should create a new job with batch notifications', async () => {
    const pubsubTopic = `projects/${projectId}/topics/${topicId}`;
    const expectedNotifications = [
      {
        pubsubTopic,
        message: {
          newJobState: 'STATE_UNSPECIFIED',
          newTaskState: 'STATE_UNSPECIFIED',
          type: 'JOB_STATE_CHANGED',
        },
      },
      {
        pubsubTopic,
        message: {
          type: 'TASK_STATE_CHANGED',
          newTaskState: 'FAILED',
          newJobState: 'STATE_UNSPECIFIED',
        },
      },
    ];

    await callCreateBatchNotifications(projectId, region, jobName, topicId);
    const createdJob = (
      await getJob(batchClient, projectId, region, jobName)
    )[0];

    assert.deepEqual(createdJob.notifications, expectedNotifications);
  });
});
