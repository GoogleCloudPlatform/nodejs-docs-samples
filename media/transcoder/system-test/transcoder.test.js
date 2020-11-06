/**
 * Copyright 2020, Google, Inc.
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

const path = require('path');
const assert = require('assert');
const {execSync} = require('child_process');

const {Storage} = require('@google-cloud/storage');
const bucketName = 'nodejs-samples-transcoder-test';
const storage = new Storage();

const projectId = process.env.GOOGLE_CLOUD_PROJECT;
const projectNumber = process.env.GOOGLE_CLOUD_PROJECT_NUMBER;
const location = 'us-central1';
const templateId = 'my-nodejs-test-template';
const preset = 'preset/web-hd';

const testFileName = 'ChromeCast.mp4';
const inputUri = `gs://${bucketName}/${testFileName}`;
const outputUriForPreset = `gs://${bucketName}/test-output-preset/`;
const outputUriForTemplate = `gs://${bucketName}/test-output-template/`;
const outputUriForAdHoc = `gs://${bucketName}/test-output-adhoc/`;

const cwdDatasets = path.join(__dirname, '../../testdata');
const cwd = path.join(__dirname, '..');

const resourceFile = `../testdata/${testFileName}`;
const installDeps = 'npm install';

// Run npm install on datasets directory because modalities
// require bootstrapping datasets, and Kokoro needs to know
// to install dependencies from the datasets directory.
assert.ok(execSync(installDeps, {cwd: `${cwd}/../transcoder`, shell: true}));
before(async () => {
  assert(
    process.env.GOOGLE_CLOUD_PROJECT,
    'Must set GOOGLE_CLOUD_PROJECT environment variable!'
  );
  assert(
    process.env.GOOGLE_CLOUD_PROJECT_NUMBER,
    'Must set GOOGLE_CLOUD_PROJECT_NUMBER environment variable!'
  );
  assert(
    process.env.GOOGLE_APPLICATION_CREDENTIALS,
    'Must set GOOGLE_APPLICATION_CREDENTIALS environment variable!'
  );
  // Create a Cloud Storage bucket to be used for testing.
  async function deleteFiles() {
    const [files] = await storage.bucket(bucketName).getFiles();
    for (const file of files) {
      await storage.bucket(bucketName).file(file.name).delete();
    }
  }

  await deleteFiles();
  await storage.bucket(bucketName).delete();
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
  await storage.bucket(bucketName).upload(resourceFile);

  execSync(`node deleteJobTemplate.js ${projectId} ${location} ${templateId}`, {
    cwd,
  });
});

const templateName = `projects/${projectNumber}/locations/${location}/jobTemplates/${templateId}`;

it('should create a job template', () => {
  const output = execSync(
    `node createJobTemplate.js ${projectId} ${location} ${templateId}`,
    {cwd}
  );
  assert.ok(output.includes(templateName));
});

it('should get a job template', () => {
  const output = execSync(
    `node getJobTemplate.js ${projectId} ${location} ${templateId}`,
    {cwd}
  );
  assert.ok(output.includes(templateName));
});

it('should show a list of job templates', () => {
  const output = execSync(`node listJobTemplates.js ${projectId} ${location}`, {
    cwd,
  });
  assert.ok(output.includes(templateName));
});

it('should delete a job template', () => {
  const output = execSync(
    `node deleteJobTemplate.js ${projectId} ${location} ${templateId}`,
    {cwd}
  );
  assert.ok(output.includes('Deleted job template'));
});

it('should create a job from preset', () => {
  let output = execSync(
    `node createJobFromPreset.js ${projectId} ${location} ${inputUri} ${outputUriForPreset} ${preset}`,
    {cwd}
  );
  assert.ok(
    output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
  );
  let id = output.toString().split('/');
  id = id[id.length - 1];
  const jobName = `projects/${projectNumber}/locations/${location}/jobs/${id}`;

  output = execSync(`node getJob.js ${projectId} ${location} ${id}`, {cwd});
  assert.ok(output.includes(jobName));

  output = execSync(`node listJobs.js ${projectId} ${location}`, {cwd});
  assert.ok(output.includes(jobName));

  function getState() {
    output = execSync(`node getJobState.js ${projectId} ${location} ${id}`, {
      cwd,
    });
    assert.ok(output.includes('Job state: SUCCEEDED'));

    output = execSync(`node deleteJob.js ${projectId} ${location} ${id}`, {
      cwd,
    });
    assert.ok(output.includes('Deleted job'));
  }
  setTimeout(getState, 60000);
});

it('should create a job from an adhoc config', () => {
  let output = execSync(
    `node createJobFromAdHoc.js ${projectId} ${location} ${inputUri} ${outputUriForAdHoc}`,
    {cwd}
  );
  assert.ok(
    output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
  );
  let id = output.toString().split('/');
  id = id[id.length - 1];
  const jobName = `projects/${projectNumber}/locations/${location}/jobs/${id}`;

  output = execSync(`node getJob.js ${projectId} ${location} ${id}`, {cwd});
  assert.ok(output.includes(jobName));

  output = execSync(`node listJobs.js ${projectId} ${location}`, {cwd});
  assert.ok(output.includes(jobName));

  function getState() {
    output = execSync(`node getJobState.js ${projectId} ${location} ${id}`, {
      cwd,
    });
    assert.ok(output.includes('Job state: SUCCEEDED'));

    output = execSync(`node deleteJob.js ${projectId} ${location} ${id}`, {
      cwd,
    });
    assert.ok(output.includes('Deleted job'));
  }
  setTimeout(getState, 60000);
});

it('should create a job from a template', () => {
  let output = execSync(
    `node createJobTemplate.js ${projectId} ${location} ${templateId}`,
    {cwd}
  );
  assert.ok(output.includes(templateName));

  output = execSync(
    `node createJobFromTemplate.js ${projectId} ${location} ${inputUri} ${outputUriForTemplate} ${templateId}`,
    {cwd}
  );
  assert.ok(
    output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
  );
  let id = output.toString().split('/');
  id = id[id.length - 1];
  const jobName = `projects/${projectNumber}/locations/${location}/jobs/${id}`;

  output = execSync(`node getJob.js ${projectId} ${location} ${id}`, {cwd});
  assert.ok(output.includes(jobName));

  output = execSync(`node listJobs.js ${projectId} ${location}`, {cwd});
  assert.ok(output.includes(jobName));

  output = execSync(
    `node deleteJobTemplate.js ${projectId} ${location} ${templateId}`,
    {cwd}
  );
  assert.ok(output.includes('Deleted job template'));

  function getState() {
    output = execSync(`node getJobState.js ${projectId} ${location} ${id}`, {
      cwd,
    });
    assert.ok(output.includes('Job state: SUCCEEDED'));

    output = execSync(`node deleteJob.js ${projectId} ${location} ${id}`, {
      cwd,
    });
    assert.ok(output.includes('Deleted job'));
  }
  setTimeout(getState, 60000);
});
