/**
 * Copyright 2020 Google LLC
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
const {describe, it, before, after, afterEach} = require('mocha');

const {Storage} = require('@google-cloud/storage');
const uniqueID = uuidv4().split('-')[0];
const bucketName = `nodejs-samples-transcoder-test-${uniqueID}`;
const storage = new Storage();

const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const templateId = `nodejs-test-transcoder-template-${uniqueID}`;
const preset = 'preset/web-hd';
const templateName = `/locations/${location}/jobTemplates/${templateId}`;

const testFileName = 'ChromeCast.mp4';
const testOverlayFileName = 'overlay.jpg';
const testConcat1FileName = 'ForBiggerEscapes.mp4';
const testConcat2FileName = 'ForBiggerJoyrides.mp4';
const testCaptionFileName = 'captions.srt';
const testSubtitles1FileName = 'subtitles-en.srt';
const testSubtitles2FileName = 'subtitles-es.srt';
const inputUri = `gs://${bucketName}/${testFileName}`;
const overlayUri = `gs://${bucketName}/${testOverlayFileName}`;
const concat1Uri = `gs://${bucketName}/${testConcat1FileName}`;
const concat2Uri = `gs://${bucketName}/${testConcat2FileName}`;
const captionsUri = `gs://${bucketName}/${testCaptionFileName}`;
const subtitles1Uri = `gs://${bucketName}/${testSubtitles1FileName}`;
const subtitles2Uri = `gs://${bucketName}/${testSubtitles2FileName}`;
const outputUriForPreset = `gs://${bucketName}/test-output-preset/`;
const outputUriForPresetBatchMode = `gs://${bucketName}/test-output-preset-batch-mode/`;
const outputUriForTemplate = `gs://${bucketName}/test-output-template/`;
const outputUriForAdHoc = `gs://${bucketName}/test-output-adhoc/`;
const outputUriForStaticOverlay = `gs://${bucketName}/test-output-static-overlay/`;
const outputUriForAnimatedOverlay = `gs://${bucketName}/test-output-animated-overlay/`;
const outputDirForSetNumberImagesSpritesheet =
  'test-output-set-number-spritesheet/';
const outputUriForSetNumberImagesSpritesheet = `gs://${bucketName}/${outputDirForSetNumberImagesSpritesheet}`;
const outputDirForPeriodicImagesSpritesheet =
  'test-output-periodic-spritesheet/';
const outputUriForPeriodicImagesSpritesheet = `gs://${bucketName}/${outputDirForPeriodicImagesSpritesheet}`;
// Spritesheets are generated from the input video into the bucket directories above.
// Spritesheets use the following file naming conventions:
const smallSpriteSheetFileName = 'small-sprite-sheet0000000000.jpeg';
const largeSpriteSheetFileName = 'large-sprite-sheet0000000000.jpeg';
const outputUriForConcatenated = `gs://${bucketName}/test-output-concat/`;
const outputUriForEmbeddedCaptions = `gs://${bucketName}/test-output-embedded-captions/`;
const outputUriForStandaloneCaptions = `gs://${bucketName}/test-output-standalone-captions/`;

const cwd = path.join(__dirname, '..');
const videoFile = `testdata/${testFileName}`;
const overlayFile = `testdata/${testOverlayFileName}`;
const concat1File = `testdata/${testConcat1FileName}`;
const concat2File = `testdata/${testConcat2FileName}`;
const captionFile = `testdata/${testCaptionFileName}`;
const subtitles1File = `testdata/${testSubtitles1FileName}`;
const subtitles2File = `testdata/${testSubtitles2FileName}`;

const delay = async (test, addMs) => {
  const retries = test.currentRetry();
  await new Promise(r => setTimeout(r, addMs));
  // No retry on the first failure.
  if (retries === 0) return;
  // See: https://cloud.google.com/storage/docs/exponential-backoff
  const ms = Math.pow(2, retries) * 10000 + Math.random() * 1000;
  return new Promise(done => {
    console.info(`retrying "${test.title}" in ${ms}ms`);
    setTimeout(done, ms);
  });
};

function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      return resolve();
    }, ms);
  });
}

const checkFileExists = async function (bucketName, fileName) {
  const [files] = await storage.bucket(bucketName).getFiles();
  for (let i = 0; i < files.length; i++) {
    if (files[i].name === fileName) {
      return true;
    }
  }
  return false;
};

before(async () => {
  // Create a Cloud Storage bucket to be used for testing.
  await storage.createBucket(bucketName);
  await storage.bucket(bucketName).upload(videoFile);
  await storage.bucket(bucketName).upload(overlayFile);
  await storage.bucket(bucketName).upload(concat1File);
  await storage.bucket(bucketName).upload(concat2File);
  await storage.bucket(bucketName).upload(captionFile);
  await storage.bucket(bucketName).upload(subtitles1File);
  await storage.bucket(bucketName).upload(subtitles2File);
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
  // Delete outstanding jobs created more than 3 days ago
  const {TranscoderServiceClient} =
    require('@google-cloud/video-transcoder').v1;
  const transcoderServiceClient = new TranscoderServiceClient();
  const [jobs] = await transcoderServiceClient.listJobs({
    parent: transcoderServiceClient.locationPath(projectId, location),
  });
  const THREE_DAYS_IN_SEC = 60 * 60 * 24 * 3;
  const DATE_NOW_SEC = Math.floor(Date.now() / 1000);

  for (const job of jobs) {
    if (job.createTime.seconds < DATE_NOW_SEC - THREE_DAYS_IN_SEC) {
      const request = {
        name: job.name,
      };
      await transcoderServiceClient.deleteJob(request);
    }
  }
});

describe('Job template functions', () => {
  before(() => {
    // Delete the job template if it already exists
    try {
      execSync(
        `node deleteJobTemplate.js ${projectId} ${location} ${templateId}`,
        {
          cwd,
        }
      );
    } catch (err) {
      // ignore not found error
    }

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
  let presetJobId;
  function createJobFromPreset() {
    const output = execSync(
      `node createJobFromPreset.js ${projectId} ${location} ${inputUri} ${outputUriForPreset} ${preset}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    presetJobId = output.toString().split('/').pop();
  }

  afterEach(() => {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${presetJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', () => {
    createJobFromPreset();
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${presetJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${presetJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', () => {
    createJobFromPreset();
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `/locations/${location}/jobs/${presetJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    createJobFromPreset();
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${presetJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
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
    assert.ok(output.includes(`/locations/${location}/jobs/`));
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
    const jobName = `/locations/${location}/jobs/${this.templateJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `/locations/${location}/jobs/${this.templateJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.templateJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job functions adhoc', () => {
  before(function () {
    const output = execSync(
      `node createJobFromAdHoc.js ${projectId} ${location} ${inputUri} ${outputUriForAdHoc}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
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
    const jobName = `/locations/${location}/jobs/${this.adhocJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `/locations/${location}/jobs/${this.adhocJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.adhocJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job functions preset batch mode', () => {
  before(function () {
    const output = execSync(
      `node createJobFromPresetBatchMode.js ${projectId} ${location} ${inputUri} ${outputUriForPresetBatchMode} ${preset}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    this.presetBatchModeJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.presetBatchModeJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.presetBatchModeJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${this.presetBatchModeJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should show a list of jobs', function () {
    const output = execSync(`node listJobs.js ${projectId} ${location}`, {
      cwd,
    });
    const jobName = `/locations/${location}/jobs/${this.presetBatchModeJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.presetBatchModeJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job with static overlay functions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithStaticOverlay.js ${projectId} ${location} ${inputUri} ${overlayUri} ${outputUriForStaticOverlay}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
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
    const jobName = `/locations/${location}/jobs/${this.staticOverlayJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.staticOverlayJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job with animated overlay functions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithAnimatedOverlay.js ${projectId} ${location} ${inputUri} ${overlayUri} ${outputUriForAnimatedOverlay}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
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
    const jobName = `/locations/${location}/jobs/${this.animatedOverlayJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.animatedOverlayJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job with set number of images spritesheet', () => {
  before(function () {
    const output = execSync(
      `node createJobWithSetNumberImagesSpritesheet.js ${projectId} ${location} ${inputUri} ${outputUriForSetNumberImagesSpritesheet}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    this.setNumberSpritesheetJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.setNumberSpritesheetJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.setNumberSpritesheetJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${this.setNumberSpritesheetJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.setNumberSpritesheetJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });

  it('should check that the spritesheet files exist in the bucket', async () => {
    assert.equal(
      await checkFileExists(
        bucketName,
        `${outputDirForSetNumberImagesSpritesheet}${smallSpriteSheetFileName}`
      ),
      true
    );
    assert.equal(
      await checkFileExists(
        bucketName,
        `${outputDirForSetNumberImagesSpritesheet}${largeSpriteSheetFileName}`
      ),
      true
    );
  });
});

describe('Job with periodic images spritesheet', () => {
  before(function () {
    const output = execSync(
      `node createJobWithPeriodicImagesSpritesheet.js ${projectId} ${location} ${inputUri} ${outputUriForPeriodicImagesSpritesheet}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    this.periodicSpritesheetJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.periodicSpritesheetJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.periodicSpritesheetJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${this.periodicSpritesheetJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.periodicSpritesheetJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });

  it('should check that the spritesheet files exist in the bucket', async () => {
    assert.equal(
      await checkFileExists(
        bucketName,
        `${outputDirForPeriodicImagesSpritesheet}${smallSpriteSheetFileName}`
      ),
      true
    );
    assert.equal(
      await checkFileExists(
        bucketName,
        `${outputDirForPeriodicImagesSpritesheet}${largeSpriteSheetFileName}`
      ),
      true
    );
  });
});

describe('Job with concatenated inputs functions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithConcatenatedInputs.js ${projectId} ${location} ${concat1Uri} 0 8.1 ${concat2Uri} 3.5 15 ${outputUriForConcatenated}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    this.concatenatedJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.concatenatedJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.concatenatedJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${this.concatenatedJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.concatenatedJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job with embedded captions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithEmbeddedCaptions.js ${projectId} ${location} ${inputUri} ${captionsUri} ${outputUriForEmbeddedCaptions}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    this.embeddedCaptionsJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.embeddedCaptionsJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.embeddedCaptionsJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${this.embeddedCaptionsJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.embeddedCaptionsJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});

describe('Job with standalone captions', () => {
  before(function () {
    const output = execSync(
      `node createJobWithStandaloneCaptions.js ${projectId} ${location} ${inputUri} ${subtitles1Uri} ${subtitles2Uri} ${outputUriForStandaloneCaptions}`,
      {cwd}
    );
    assert.ok(output.includes(`/locations/${location}/jobs/`));
    this.standaloneCaptionsJobId = output.toString().split('/').pop();
  });

  after(function () {
    const output = execSync(
      `node deleteJob.js ${projectId} ${location} ${this.standaloneCaptionsJobId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted job'));
  });

  it('should get a job', function () {
    const output = execSync(
      `node getJob.js ${projectId} ${location} ${this.standaloneCaptionsJobId}`,
      {cwd}
    );
    const jobName = `/locations/${location}/jobs/${this.standaloneCaptionsJobId}`;
    assert.ok(output.includes(jobName));
  });

  it('should check that the job succeeded', async function () {
    this.retries(5);
    await delay(this.test, 30000);

    let getAttempts = 0;
    while (getAttempts < 5) {
      const ms = Math.pow(2, getAttempts + 1) * 10000 + Math.random() * 1000;
      await wait(ms);
      const output = execSync(
        `node getJobState.js ${projectId} ${location} ${this.standaloneCaptionsJobId}`,
        {cwd}
      );
      if (output.includes('Job state: SUCCEEDED')) {
        assert.ok(true);
        return;
      }
      getAttempts++;
    }
    assert.ok(false);
  });
});
