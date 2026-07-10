// Copyright 2018 Google LLC
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

'use strict';

const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const assert = require('assert');

const getSample = () => {
  const getProjectIdStub = sinon.stub().resolves('test-project');
  const listStub = sinon.stub().resolves([{ items: [{ name: 'test-instance' }] }]);
  const patchStub = sinon.stub().resolves([{ name: 'test-operation' }]);
  const registeredFunctions = {};

  proxyquire('../index', {
    '@google-cloud/functions-framework': {
      cloudEvent: (name, handler) => {
        registeredFunctions[name] = handler;
      },
    },
    '@google-cloud/sql': {
      SqlInstancesServiceClient: function () {
        this.getProjectId = getProjectIdStub;
        this.list = listStub;
        this.patch = patchStub;
      },
    },
  });

  return {
    registeredFunctions,
    mocks: {
      getProjectIdStub,
      listStub,
      patchStub,
    },
  };
};

const getCloudEvent = (data) => ({
  data: {
    message: {
      data: Buffer.from(JSON.stringify(data)).toString('base64'),
    },
  },
});

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

describe('functions_start_instance_event', () => {
  it('startInstanceEvent: should accept CloudEvent payload with label', async () => {
    const sample = getSample();
    const cloudEvent = getCloudEvent({ label: 'env=dev' });

    await sample.registeredFunctions.startInstanceEvent(cloudEvent);

    assert.strictEqual(sample.mocks.getProjectIdStub.calledOnce, true);
    assert.strictEqual(sample.mocks.listStub.calledOnce, true);
    assert.deepStrictEqual(sample.mocks.listStub.firstCall.args[0], {
      project: 'test-project',
      filter: 'settings.userLabels.env:dev',
    });
    assert.strictEqual(sample.mocks.patchStub.calledOnce, true);
    assert.deepStrictEqual(sample.mocks.patchStub.firstCall.args[0], {
      project: 'test-project',
      instance: 'test-instance',
      body: {
        settings: {
          activationPolicy: 'ALWAYS',
        },
      },
    });
  });

  it("startInstanceEvent: should fail with missing 'label' attribute", async () => {
    const sample = getSample();
    const cloudEvent = getCloudEvent({ other: 'value' });

    await assert.rejects(
      sample.registeredFunctions.startInstanceEvent(cloudEvent),
      /Attribute 'label' missing from payload/
    );
  });

  it('startInstanceEvent: should handle zero instances gracefully', async () => {
    const sample = getSample();
    sample.mocks.listStub.resolves([{}]); // Empty object missing 'items' property
    const cloudEvent = getCloudEvent({ label: 'env=dev' });

    await sample.registeredFunctions.startInstanceEvent(cloudEvent);

    assert.strictEqual(sample.mocks.patchStub.called, false);
  });

  it('startInstanceEvent: should fail with invalid CloudEvent payload', async () => {
    const sample = getSample();
    const cloudEvent = {
      data: {
        message: {
          data: 'invalid-base64-payload',
        },
      },
    };

    await assert.rejects(
      sample.registeredFunctions.startInstanceEvent(cloudEvent),
      /Invalid CloudEvent \/ Pub\/Sub message/
    );
  });
});

describe('functions_stop_instance_event', () => {
  it('stopInstanceEvent: should accept CloudEvent payload with label', async () => {
    const sample = getSample();
    const cloudEvent = getCloudEvent({ label: 'env=dev' });

    await sample.registeredFunctions.stopInstanceEvent(cloudEvent);

    assert.strictEqual(sample.mocks.getProjectIdStub.calledOnce, true);
    assert.strictEqual(sample.mocks.listStub.calledOnce, true);
    assert.deepStrictEqual(sample.mocks.listStub.firstCall.args[0], {
      project: 'test-project',
      filter: 'settings.userLabels.env:dev',
    });
    assert.strictEqual(sample.mocks.patchStub.calledOnce, true);
    assert.deepStrictEqual(sample.mocks.patchStub.firstCall.args[0], {
      project: 'test-project',
      instance: 'test-instance',
      body: {
        settings: {
          activationPolicy: 'NEVER',
        },
      },
    });
  });

  it("stopInstanceEvent: should fail with missing 'label' attribute", async () => {
    const sample = getSample();
    const cloudEvent = getCloudEvent({ other: 'value' });

    await assert.rejects(
      sample.registeredFunctions.stopInstanceEvent(cloudEvent),
      /Attribute 'label' missing from payload/
    );
  });

  it('stopInstanceEvent: should handle zero instances gracefully', async () => {
    const sample = getSample();
    sample.mocks.listStub.resolves([{ items: [] }]); // Empty items array
    const cloudEvent = getCloudEvent({ label: 'env=dev' });

    await sample.registeredFunctions.stopInstanceEvent(cloudEvent);

    assert.strictEqual(sample.mocks.patchStub.called, false);
  });
});
