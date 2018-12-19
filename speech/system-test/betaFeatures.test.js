/**
 * Copyright 2016, Google, LLC.
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
const {assert} = require('chai');
const execa = require('execa');

const cmd = 'node betaFeatures.js';
const cwd = path.join(__dirname, `..`);
const exec = async cmd => (await execa.shell(cmd, {cwd})).stdout;

//audio file paths
const resourcePath = path.join(__dirname, '..', 'resources');
const monoFilePath = path.join(resourcePath, 'commercial_mono.wav');
const stereoFilePath = path.join(resourcePath, 'commercial_stereo.wav');
const multiLanguageFile = path.join(resourcePath, 'multi.wav');
const BrooklynFilePath = path.join(resourcePath, 'brooklyn.flac');

const monoUri = 'gs://cloud-samples-tests/speech/commercial_mono.wav';
const multiUri = 'gs://nodejs-docs-samples/multi_mono.wav';
const brooklynUri = 'gs://cloud-samples-tests/speech/brooklyn.flac';
const stereoUri = 'gs://cloud-samples-tests/speech/commercial_stereo.wav';

describe(`BetaFeatures`, () => {
  it('should run speech diarization on a local file', async () => {
    const output = await exec(`${cmd} Diarization -f ${monoFilePath}`);
    assert.match(output, /speakerTag: 1/);
    assert.match(output, /speakerTag: 2/);
  });

  it('should run speech diarization on a GCS file', async () => {
    const output = await exec(`${cmd} DiarizationGCS -u ${monoUri}`, cwd);
    assert.match(output, /speakerTag: 1/);
    assert.match(output, /speakerTag: 2/);
  });

  it('should run multi channel transcription on a local file', async () => {
    const output = await exec(
      `${cmd} multiChannelTranscribe -f ${stereoFilePath}`
    );
    assert.match(output, /Channel Tag: 2/);
  });

  it('should run multi channel transcription on GCS file', async () => {
    const output = await exec(
      `${cmd} multiChannelTranscribeGCS -u ${stereoUri}`
    );
    assert.match(output, /Channel Tag: 2/);
  });

  it('should transcribe multi-language on a local file', async () => {
    const output = await exec(
      `${cmd} multiLanguageTranscribe -f ${multiLanguageFile}`
    );
    assert.match(output, /Transcription: how are you doing estoy bien e tu/);
  });

  it('should transcribe multi-language on a GCS bucket', async () => {
    const output = await exec(
      `${cmd} multiLanguageTranscribeGCS -u ${multiUri}`
    );
    assert.match(output, /Transcription: how are you doing estoy bien e tu/);
  });

  it('should run word Level Confience on a local file', async () => {
    const output = await exec(
      `${cmd} wordLevelConfidence -f ${BrooklynFilePath}`
    );
    assert.match(output, /Transcription: how old is the Brooklyn Bridge/);
    assert.match(output, /Confidence: \d\.\d/);
  });

  it('should run word level confidence on a GCS bucket', async () => {
    const output = await exec(
      `${cmd} wordLevelConfidenceGCS -u ${brooklynUri}`
    );
    assert.match(output, /Transcription: how old is the Brooklyn Bridge/);
    assert.match(output, /Confidence: \d\.\d/);
  });
});
