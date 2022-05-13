// Copyright 2022 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const proxyquire = require('proxyquire');
const sinon = require('sinon');

const {getFunction} = require('@google-cloud/functions-framework/testing');

const loadSample = (adultResult, fileName) => {
  const vision = sinon.stub();
  vision.ImageAnnotatorClient = function client() {
    return {
      safeSearchDetection: () => {
        return [
          {
            safeSearchAnnotation: {
              adult: adultResult,
            },
          },
        ];
      },
    };
  };

  const storage = {
    Storage: function client() {
      return {
        bucket: sinon.stub().returnsThis(),
        file: sinon.stub().returnsThis(),
        upload: sinon.stub().returnsThis(),
        download: sinon.stub().returnsThis(),
        name: fileName,
      };
    },
  };

  const gm = () => {
    return {
      blur: sinon.stub().returnsThis(),
      write: sinon.stub().yields(),
    };
  };
  gm.subClass = sinon.stub().returnsThis();

  const fs = {
    promises: {
      unlink: sinon.stub(),
    },
  };

  return proxyquire('..', {
    '@google-cloud/vision': vision,
    '@google-cloud/storage': storage,
    gm: gm,
    fs: fs,
  });
};

describe('functions_imagemagick_setup functions_imagemagick_analyze functions_imagemagick_blur', () => {
  const assert = require('assert');
  const sinon = require('sinon');

  const stubConsole = function () {
    sinon.stub(console, 'log');
    sinon.stub(console, 'error');
  };

  const restoreConsole = function () {
    console.log.restore();
    console.error.restore();
  };

  beforeEach(stubConsole);
  afterEach(restoreConsole);

  it('blurOffensiveImages marks safe images OK', async () => {
    const fileName = 'safe.jpg';
    loadSample('UNLIKELY', fileName);

    const event = {
      id: '1234',
      type: 'mock-gcs-event',
      data: {
        bucket: 'my-bucket',
        name: 'safe.jpg',
      },
    };

    // Call tested function and verify its behavior
    const blurOffensiveImages = getFunction('blurOffensiveImages');

    await blurOffensiveImages(event);

    assert(console.log.calledWith('Detected safe.jpg as OK.'));
  });

  it('blurOffensiveImages successfully blurs offensive images', async () => {
    const fileName = 'offensive.jpg';
    loadSample('VERY_LIKELY', fileName);

    const event = {
      id: '1234',
      type: 'mock-gcs-event',
      data: {
        bucket: 'my-bucket',
        name: fileName,
      },
    };

    // Call tested function and verify its behavior
    const blurOffensiveImages = getFunction('blurOffensiveImages');

    await blurOffensiveImages(event);

    assert(console.log.calledWith('Detected offensive.jpg as inappropriate.'));
  });
});
