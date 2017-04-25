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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);

const bucketName = `my-bucket`;
const filename = `image.jpg`;

function getSample () {
  const file = {
    getMetadata: sinon.stub().returns(Promise.resolve([{}])),
    setMetadata: sinon.stub().returns(Promise.resolve()),
    download: sinon.stub().returns(Promise.resolve()),
    bucket: bucketName,
    name: filename
  };
  const bucket = {
    file: sinon.stub().returns(file),
    upload: sinon.stub().returns(Promise.resolve())
  };
  file.bucket = bucket;
  const storageMock = {
    bucket: sinon.stub().returns(bucket)
  };
  const visionMock = {
    detectSafeSearch: sinon.stub().returns(Promise.resolve([{ violence: true }]))
  };
  const StorageMock = sinon.stub().returns(storageMock);
  const VisionMock = sinon.stub().returns(visionMock);
  const childProcessMock = {
    exec: sinon.stub().yields()
  };
  const fsMock = {
    unlink: sinon.stub().yields()
  };

  return {
    program: proxyquire(`../`, {
      '@google-cloud/vision': VisionMock,
      '@google-cloud/storage': StorageMock,
      'child_process': childProcessMock,
      'fs': fsMock
    }),
    mocks: {
      fs: fsMock,
      childProcess: childProcessMock,
      storage: storageMock,
      bucket,
      file,
      vision: visionMock
    }
  };
}

test.beforeEach(tools.stubConsole);
test.afterEach.always(tools.restoreConsole);

test.serial(`blurOffensiveImages does nothing on delete`, async (t) => {
  await getSample().program.blurOffensiveImages({ data: { resourceState: `not_exists` } });
  t.is(console.log.callCount, 1);
  t.deepEqual(console.log.getCall(0).args, ['This is a deletion event.']);
});

test.serial(`blurOffensiveImages does nothing on deploy`, async (t) => {
  await getSample().program.blurOffensiveImages({ data: {} });
  t.is(console.log.callCount, 1);
  t.deepEqual(console.log.getCall(0).args, ['This is a deploy event.']);
});

test.serial(`blurOffensiveImages blurs images`, async (t) => {
  const sample = getSample();
  await sample.program.blurOffensiveImages({ data: { bucket: bucketName, name: filename } });
  t.is(console.log.callCount, 5);
  t.deepEqual(console.log.getCall(0).args, [`Analyzing ${sample.mocks.file.name}.`]);
  t.deepEqual(console.log.getCall(1).args, [`The image ${sample.mocks.file.name} has been detected as inappropriate.`]);
  t.deepEqual(console.log.getCall(2).args, [`Image ${sample.mocks.file.name} has been downloaded to /tmp/${sample.mocks.file.name}.`]);
  t.deepEqual(console.log.getCall(3).args, [`Image ${sample.mocks.file.name} has been blurred.`]);
  t.deepEqual(console.log.getCall(4).args, [`Blurred image has been uploaded to ${sample.mocks.file.name}.`]);
});

test.serial(`blurOffensiveImages ignores safe images`, async (t) => {
  const sample = getSample();
  sample.mocks.vision.detectSafeSearch = sinon.stub().returns(Promise.resolve([{}]));
  await sample.program.blurOffensiveImages({ data: { bucket: bucketName, name: filename } });
  t.is(console.log.callCount, 2);
  t.deepEqual(console.log.getCall(0).args, [`Analyzing ${sample.mocks.file.name}.`]);
  t.deepEqual(console.log.getCall(1).args, [`The image ${sample.mocks.file.name} has been detected as OK.`]);
});
