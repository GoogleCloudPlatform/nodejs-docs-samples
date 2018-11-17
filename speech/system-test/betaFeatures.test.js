// /**
//  * Copyright 2016, Google, LLC.
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *    http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

/* eslint-disable */

'use strict';

const path = require(`path`);
const assert = require(`assert`);

const {runAsync} = require(`@google-cloud/nodejs-repo-tools`);

const cmd = `node betaFeatures.js`;
const cwd = path.join(__dirname, `..`);

//audio file paths
const monoFileName = `commercial_mono.wav`;
const monoFilePath = path.join(__dirname, `../resources/${monoFileName}`);

const stereoFileName = `commercial_stereo.wav`;
const stereoFilePath = path.join(__dirname, `../resources/${stereoFileName}`);
const multiLanguageFileName = `multi.wav`;
const multiLanguageFile = path.join(
  __dirname,
  `../resources/${multiLanguageFileName}`
);

const gnomef = `Google_Gnome.wav`;
const gnome = path.join(__dirname, `../resources/${gnomef}`);

const Brooklyn = 'brooklyn.flac';
const BrooklynFilePath = path.join(__dirname, `../resources/${Brooklyn}`);

const monoUri = `gs://cloud-samples-tests/speech/commercial_mono.wav`;
const multiUri = `gs://nodejs-docs-samples/multi_mono.wav`;
const brooklynUri = `gs://cloud-samples-tests/speech/brooklyn.flac`;
const stereoUri = `gs://cloud-samples-tests/speech/commercial_stereo.wav`;

describe(`BetaFeatures`, () => {

  it(`should run speech diarization on a local file`, async () => {
    const output = await runAsync(
      `${cmd} Diarization -f ${monoFilePath}`,
      cwd
    );
    assert.ok(
      output.includes(`speakerTag: 1`) && output.includes(`speakerTag: 2`)
    );
  });

  it(`should run speech diarization on a GCS file`, async () => {
    const output = await runAsync(`${cmd} DiarizationGCS -u ${monoUri}`, cwd);
    assert.ok(
      output.includes(`speakerTag: 1`) && output.includes(`speakerTag: 2`)
    );
  });

  it(`should run multi channel transcription on a local file`, async () => {
    const output = await runAsync(
      `${cmd} multiChannelTranscribe -f ${stereoFilePath}`,
      cwd
    );
    assert.ok(output.includes(`Channel Tag: 2`));
  });

  it(`should run multi channel transcription on GCS file`, async () => {
    const output = await runAsync(
      `${cmd} multiChannelTranscribeGCS -u ${stereoUri}`,
      cwd
    );
    assert.ok(output.includes(`Channel Tag: 2`));
  });

  it(`should transcribe multi-language on a local file`, async () => {
    const output = await runAsync(
      `${cmd} multiLanguageTranscribe -f ${multiLanguageFile}`,
      cwd
    );
    assert.ok(output.includes(`Transcription: how are you doing estoy bien e tu`));
  });

  it(`should transcribe multi-language on a GCS bucket`, async () => {
    const output = await runAsync(
      `${cmd} multiLanguageTranscribeGCS -u ${multiUri}`,
      cwd
    );
    assert.ok(
      output.includes(`Transcription: how are you doing estoy bien e tu`)
    );
  });

  it(`should run word Level Confience on a local file`, async () => {
    const output = await runAsync(
      `${cmd} wordLevelConfidence -f ${BrooklynFilePath}`
    );
    assert.ok(
      output.includes(`Transcription: how old is the Brooklyn Bridge`)
    );
    assert.ok(/Confidence: \d\.\d/.test(output));
  });

  it(`should run word level confidence on a GCS bucket`, async () => {
    const output = await runAsync(
      `${cmd} wordLevelConfidenceGCS -u ${brooklynUri}`,
      cwd
    );
    assert.ok(
      output.includes(`Transcription: how old is the Brooklyn Bridge`) &&
        /Confidence: \d\.\d/.test(output)
    );
  });
});
