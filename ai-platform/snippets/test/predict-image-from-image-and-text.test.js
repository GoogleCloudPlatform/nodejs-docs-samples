/*
 * Copyright 2023 Google LLC
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

import {assert} from 'chai';
import {describe, it} from 'mocha';
import sinon from 'sinon';
import {predictImageFromImageAndText} from '../predict-image-from-image-and-text.js';

const project = process.env.CAIP_PROJECT_ID;
const LOCATION = 'us-central1';
const baseImagePath = 'resources/daisy.jpg';
const textPrompt = 'an impressionist painting';

describe('AI platform generates image from image and text', async () => {
  const stubConsole = function () {
    sinon.stub(console, 'error');
    sinon.stub(console, 'log');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('should make predictions using a large language model', async () => {
    await predictImageFromImageAndText(
      project,
      LOCATION,
      baseImagePath,
      textPrompt
    );
    assert.include(console.log.firstCall.args, 'Get image embedding response');
  });
});
