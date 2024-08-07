// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function deleteJob(batchClient, projectId, region, jobId) {
  const request = {
    name: `projects/${projectId}/locations/${region}/jobs/${jobId}`,
  };
  try {
    await batchClient.deleteJob(request);
  } catch (err) {
    console.error('Deleting job failed: ', err);
  }
}

async function getJob(batchClient, projectId, region, jobId) {
  const request = {
    name: `projects/${projectId}/locations/${region}/jobs/${jobId}`,
  };
  try {
    return await batchClient.getJob(request);
  } catch (err) {
    console.error('Fetching job failed: ', err);
  }
}

module.exports = {
  deleteJob,
  getJob,
};
