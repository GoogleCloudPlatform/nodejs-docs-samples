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
const {v4: uuidv4} = require('uuid');
const {execSync} = require('child_process');
const {describe, it, before, after} = require('mocha');

const {Storage} = require('@google-cloud/storage');
const uniqueID = uuidv4().split('-')[0];
const bucketName = `nodejs-samples-transcoder-test-${uniqueID}`;
const storage = new Storage();

const projectNumber = process.env.GOOGLE_CLOUD_PROJECT_NUMBER;
const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const templateId = `nodejs-test-transcoder-template-${uniqueID}`;
const preset = 'preset/web-hd';
const templateName = `projects/${projectNumber}/locations/${location}/jobTemplates/${templateId}`;

const testFileName = 'ChromeCast.mp4';
const testOverlayFileName = 'overlay.jpg';

const inputUri = `gs://${bucketName}/${testFileName}`;
const overlayUri = `gs://${bucketName}/${testOverlayFileName}`;
const outputUriForPreset = `gs://${bucketName}/test-output-preset/`;
const outputUriForTemplate = `gs://${bucketName}/test-output-template/`;
const outputUriForAdHoc = `gs://${bucketName}/test-output-adhoc/`;
const outputUriForStaticOverlay = `gs://${bucketName}/test-output-static-overlay/`;
const outputUriForAnimatedOverlay = `gs://${bucketName}/test-output-animated-overlay/`;

const cwd = path.join(__dirname, '..');
const videoFile = `testdata/${testFileName}`;
const overlayFile = `testdata/${testOverlayFileName}`;

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve();
    }, ms);
  });
}

before(async () => {
  assert(
    process.env.GOOGLE_CLOUD_PROJECT_NUMBER,
    'Must set GOOGLE_CLOUD_PROJECT_NUMBER environment variable!'
  );
  // Create a Cloud Storage bucket to be used for testing.
  await storage.createBucket(bucketName);
  await storage.bucket(bucketName).upload(videoFile);
  await storage.bucket(bucketName).upload(overlayFile);
});

after(async () => {
  async function deleteFiles() {
    const [files] = await storage.bucket(bucketName).getFiles();
    for (const file of files) {
      await storage.bucket(bucketName).file(file.name).delete();
    }
  }
  try {
    await deleteFiles();
    await storage.bucket(bucketName).delete();
  } catch (err) {
    console.log('Cannot delete bucket');
  }
});

describe('Job template functions', () => {
  before(() => {
    // Delete the job template if it already exists
    execSync(
      `node deleteJobTemplate.js ${projectId} ${location} ${templateId}`,
      {
        cwd,
      }
    );
    const output = execSync(
      `node createJobTemplate.js ${projectId} ${location} ${templateId}`,
      {cwd}
    );
    assert.ok(output.includes(templateName));
  });

  after(() => {
    const output = execSync(
      `node deleteJobTemplate.js ${projectId} ${location} ${templateId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job template'));
  });

  it('should get a job template', () => {
    const output = execSync(
      `node getJobTemplate.js ${projectId} ${location} ${templateId}`,
      {cwd}
    );
    assert.ok(output.includes(templateName));
  });

  it('should show a list of job templates', () => {
    const output = execSync(
      `node listJobTemplates.js ${projectId} ${location}`,
      {
        cwd,
      }
    );
    assert.ok(output.includes(templateName));
  });
});

describe('Job functions preset', () => {
  before(function () {
    const output = execSync(
      `node createJobFromPreset.js ${projectId} ${location} ${inputUri} ${outputUriForPreset} ${preset}`,
      {cwd}
    );
    assert.ok(
      output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
    );
    this.presetJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.presetJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.presetJobId}`,
      {cwd}
    );
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.presetJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.presetJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await wait(90000);
    const output = execSync(
      `node getJobState.js ${projectId} ${location} ${this.presetJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Job state: SUCCEEDED'));
  });
});

describe('Job functions template', () => {
  before(function () {
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
    this.templateJobId = output.toString().split('/').pop();
  });

  after(function () {
    let output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.templateJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
    output = execSync(
      `node deleteJobTemplate.js ${projectId} ${location} ${templateId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job template'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.templateJobId}`,
      {cwd}
    );
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.templateJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.templateJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await wait(90000);
    const output = execSync(
      `node getJobState.js ${projectId} ${location} ${this.templateJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Job state: SUCCEEDED'));
  });
});

describe('Job functions adhoc', () => {
  before(function () {
    const output = execSync(
      `node createJobFromAdHoc.js ${projectId} ${location} ${inputUri} ${outputUriForAdHoc}`,
      {cwd}
    );
    assert.ok(
      output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
    );
    this.adhocJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.adhocJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.adhocJobId}`,
      {cwd}
    );
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.adhocJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.adhocJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await wait(90000);
    const output = execSync(
      `node getJobState.js ${projectId} ${location} ${this.adhocJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Job state: SUCCEEDED'));
  });
});

describe('Job with static overlay functions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithStaticOverlay.js ${projectId} ${location} ${inputUri} ${overlayUri} ${outputUriForStaticOverlay}`,
      {cwd}
    );
    assert.ok(
      output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
    );
    this.staticOverlayJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.staticOverlayJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.staticOverlayJobId}`,
      {cwd}
    );
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.staticOverlayJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.staticOverlayJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await wait(90000);
    const output = execSync(
      `node getJobState.js ${projectId} ${location} ${this.staticOverlayJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Job state: SUCCEEDED'));
  });
});

describe('Job with animated overlay functions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithAnimatedOverlay.js ${projectId} ${location} ${inputUri} ${overlayUri} ${outputUriForAnimatedOverlay}`,
      {cwd}
    );
    assert.ok(
      output.includes(`projects/${projectNumber}/locations/${location}/jobs/`)
    );
    this.animatedOverlayJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.animatedOverlayJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.animatedOverlayJobId}`,
      {cwd}
    );
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.animatedOverlayJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `projects/${projectNumber}/locations/${location}/jobs/${this.animatedOverlayJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await wait(90000);
    const output = execSync(
      `node getJobState.js ${projectId} ${location} ${this.animatedOverlayJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Job state: SUCCEEDED'));
  });
});
