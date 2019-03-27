/**
 * Copyright 2017, Google, Inc.
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

const proxyquire = require('proxyquire').noCallThru();
const sinon = require('sinon');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const vision = require('@google-cloud/vision').v1p1beta1;

const bucketName = 'my-bucket';
const defaultFileName = 'image.jpg';

let VisionStub = sinon.stub(vision, 'ImageAnnotatorClient');
VisionStub.returns({
  safeSearchDetection: sinon.stub().returns(
    Promise.resolve([
      {
        safeSearchAnnotation: {
          adult: 'VERY_LIKELY',
          violence: 'VERY_LIKELY',
        },
      },
    ])
  ),
});

function getSample(filename) {
  const file = {
    getMetadata: sinon.stub().returns(Promise.resolve([{}])),
    setMetadata: sinon.stub().returns(Promise.resolve()),
    download: sinon.stub().returns(Promise.resolve()),
    bucket: bucketName,
    name: filename,
  };
  const bucket = {
    file: sinon.stub().returns(file),
    upload: sinon.stub().returns(Promise.resolve()),
  };
  file.bucket = bucket;
  const storageMock = {
    bucket: sinon.stub().returns(bucket),
  };
  const StorageMock = sinon.stub().returns(storageMock);

  const gmMock = sinon.stub().returns({
    blur: sinon.stub().returnsThis(),
    write: sinon.stub().yields(),
  });
  gmMock.subClass = sinon.stub().returnsThis();

  const fsMock = {
    unlink: sinon.stub().yields(),
  };

  return {
    program: proxyquire('../', {
      '@google-cloud/storage': {Storage: StorageMock},
      gm: gmMock,
      fs: fsMock,
    }),
    mocks: {
      fs: fsMock,
      gm: gmMock,
      storage: storageMock,
      bucket,
      file,
    },
  };
}

beforeEach(tools.stubConsole);
afterEach(tools.restoreConsole);

it('blurOffensiveImages does nothing on delete', async () => {
  await getSample(defaultFileName).program.blurOffensiveImages({
    data: {resourceState: 'not_exists'},
  });
  assert.strictEqual(console.log.callCount, 1);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    'This is a deletion event.',
  ]);
});

it('blurOffensiveImages does nothing on deploy', async () => {
  await getSample(defaultFileName).program.blurOffensiveImages({data: {}});
  assert.strictEqual(console.log.callCount, 1);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    'This is a deploy event.',
  ]);
});

it('blurOffensiveImages blurs unblurred images (Node 6 syntax)', async () => {
  const sample = getSample(defaultFileName);
  await sample.program.blurOffensiveImages({
    data: {bucket: bucketName, name: defaultFileName},
  });
  assert.strictEqual(console.log.callCount, 5);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Analyzing ${sample.mocks.file.name}.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `The image ${sample.mocks.file.name} has been detected as inappropriate.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, [
    `Image ${sample.mocks.file.name} has been downloaded to /tmp/${
      sample.mocks.file.name
    }.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(3).args, [
    `Image ${sample.mocks.file.name} has been blurred.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(4).args, [
    `Blurred image has been uploaded to ${sample.mocks.file.name}.`,
  ]);
});

it('blurOffensiveImages blurs unblurred images (Node 8 syntax)', async () => {
  const sample = getSample(defaultFileName);
  await sample.program.blurOffensiveImages({
    bucket: bucketName,
    name: defaultFileName,
  });
  assert.strictEqual(console.log.callCount, 5);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Analyzing ${sample.mocks.file.name}.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `The image ${sample.mocks.file.name} has been detected as inappropriate.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(2).args, [
    `Image ${sample.mocks.file.name} has been downloaded to /tmp/${
      sample.mocks.file.name
    }.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(3).args, [
    `Image ${sample.mocks.file.name} has been blurred.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(4).args, [
    `Blurred image has been uploaded to ${sample.mocks.file.name}.`,
  ]);
});

it('blurOffensiveImages ignores already-blurred images', async () => {
  const sample = getSample('blurred-${defaultFileName}');
  await sample.program.blurOffensiveImages({
    data: {bucket: bucketName, name: `blurred-${defaultFileName}`},
  });
  assert.strictEqual(console.log.callCount, 1);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `The image ${sample.mocks.file.name} is already blurred.`,
  ]);
});

it('blurOffensiveImages ignores safe images', async () => {
  VisionStub.restore();
  VisionStub = sinon.stub(vision, 'ImageAnnotatorClient');
  VisionStub.returns({
    safeSearchDetection: sinon.stub().returns(
      Promise.resolve([
        {
          safeSearchAnnotation: {
            adult: 'VERY_UNLIKELY',
            violence: 'VERY_UNLIKELY',
          },
        },
      ])
    ),
  });
  const sample = getSample(defaultFileName);
  await sample.program.blurOffensiveImages({
    data: {bucket: bucketName, name: defaultFileName},
  });
  assert.strictEqual(console.log.callCount, 2);
  assert.deepStrictEqual(console.log.getCall(0).args, [
    `Analyzing ${sample.mocks.file.name}.`,
  ]);
  assert.deepStrictEqual(console.log.getCall(1).args, [
    `The image ${sample.mocks.file.name} has been detected as OK.`,
  ]);
});
