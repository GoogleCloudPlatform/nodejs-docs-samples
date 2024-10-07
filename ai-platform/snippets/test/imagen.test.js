/*
 * Copyright 2024 Google LLC
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

const path = require('path');
const {assert} = require('chai');
const {describe, it} = require('mocha');

const cp = require('child_process');
const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});
const cwd = path.join(__dirname, '..');

describe('AI platform generate and edit an image using Imagen', () => {
  it('should generate an image', async () => {
    const stdout = execSync('node ./imagen-generate-image.js', {
      cwd,
    });
    assert.match(stdout, /Saved image output1.png/);
  });
  it('should edit an image without using a mask', async () => {
    const stdout = execSync('node ./imagen-edit-image-mask-free.js', {
      cwd,
    });
    assert.match(stdout, /Saved image output1.png/);
  });
});

describe('AI platform edit image using Imagen inpainting and outpainting', () => {
  it('should edit an image using a mask image and inpainting insert', async () => {
    const stdout = execSync(
      'node ./imagen-edit-image-inpainting-insert-mask.js',
      {
        cwd,
      }
    );
    assert.match(stdout, /Saved image output1.png/);
  });
  it('should edit an image using a mask image and inpainting remove', async () => {
    const stdout = execSync(
      'node ./imagen-edit-image-inpainting-remove-mask.js',
      {
        cwd,
      }
    );
    assert.match(stdout, /Saved image output1.png/);
  });
  it('should edit an image using a mask image and outpainting', async () => {
    const stdout = execSync('node ./imagen-edit-image-outpainting-mask.js', {
      cwd,
    });
    assert.match(stdout, /Saved image output1.png/);
  });
});
