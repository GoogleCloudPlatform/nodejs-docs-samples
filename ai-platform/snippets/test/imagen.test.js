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

const catImageFile = 'resources/cat.png';
const womanImageFile = 'resources/woman.png';
const womanMaskImageFile = 'resources/woman_inpainting_insert_mask.png';
const volleyballImageFile = 'resources/volleyball_game.png';
const volleyballMaskImageFile =
  'resources/volleyball_game_inpainting_remove_mask.png';
const skatersImageFile = 'resources/roller_skaters.png';
const skatersMaskImageFile = 'resources/roller_skaters_mask.png';

describe('AI platform generate and edit an image using Imagen', () => {
  it('should generate an image', async () => {
    const prompt = 'a dog reading a newspaper';
    const stdout = execSync(`node ./imagen/generateImage.js ${prompt}`, {
      cwd,
    });
    assert.match(stdout, /Saved image output1.png/);
  });
  it('should edit an image without using a mask', async () => {
    const prompt = 'a dog';
    const stdout = execSync(
      `node ./imagen/editImageMaskFree.js ${catImageFile} ${prompt}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Saved image output1.png/);
  });
});

describe('AI platform edit image using Imagen inpainting and outpainting', () => {
  it('should edit an image using a mask image and inpainting insert', async () => {
    const prompt = 'hat';
    const stdout = execSync(
      `node ./imagen/editImageInpaintingInsertMask.js ${womanImageFile} ${womanMaskImageFile} ${prompt}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Saved image output1.png/);
  });
  it('should edit an image using a mask image and inpainting remove', async () => {
    const prompt = 'volleyball game';
    const stdout = execSync(
      `node ./imagen/editImageInpaintingRemoveMask.js ${volleyballImageFile} ${volleyballMaskImageFile} ${prompt}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Saved image output1.png/);
  });
  it('should edit an image using a mask image and outpainting', async () => {
    const prompt = 'city with skyscrapers';
    const stdout = execSync(
      `node ./imagen/editImageInpaintingRemoveMask.js ${skatersImageFile} ${skatersMaskImageFile} ${prompt}`,
      {
        cwd,
      }
    );
    assert.match(stdout, /Saved image output1.png/);
  });
});
