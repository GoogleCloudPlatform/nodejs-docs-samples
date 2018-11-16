/**
 * Copyright 2018, Google LLC.
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

const proxyquire = require(`proxyquire`).noCallThru();
const sinon = require(`sinon`);
const test = require(`ava`);

function getSample () {
  const instanceListMock = [
    { name: 'test-instance-1', status: 'RUNNING' },
    { name: 'test-instance-2', status: 'RUNNING' }
  ];

  const listInstancesResponseMock = {
    data: {
      items: instanceListMock
    }
  };

  const computeMock = {
    instances: {
      list: sinon.stub().returns(listInstancesResponseMock),
      stop: sinon.stub().resolves({ data: {} })
    }
  };

  const cloudbillingMock = {
    projects: {
      getBillingInfo: sinon.stub().resolves({
        data: {
          billingEnabled: true
        }
      }),
      updateBillingInfo: sinon.stub().returns({
        data: {}
      })
    }
  };

  const googleMock = {
    cloudbilling: sinon.stub().returns(cloudbillingMock),
    compute: sinon.stub().returns(computeMock),
    options: sinon.stub()
  };

  const googleapisMock = {
    google: googleMock
  };

  const slackMock = {
    chat: {
      postMessage: sinon.stub().returns({ data: {} })
    }
  };

  const credentialMock = {
    hasScopes: sinon.stub().returns(false)
  };
  credentialMock.createScoped = sinon.stub().returns(credentialMock);

  const googleAuthMock = {
    auth: {
      getApplicationDefault: sinon.stub().resolves({
        credential: credentialMock
      })
    }
  };

  return {
    program: proxyquire(`../`, {
      'google-auth-library': googleAuthMock,
      'googleapis': googleapisMock,
      'slack': slackMock
    }),
    mocks: {
      google: googleMock,
      googleAuth: googleAuthMock,
      googleapis: googleapisMock,
      compute: computeMock,
      cloudbilling: cloudbillingMock,
      credential: credentialMock,
      slack: slackMock,
      instanceList: instanceListMock
    }
  };
}

test(`should notify Slack when budget is exceeded`, async t => {
  const { program, mocks } = getSample();

  const jsonData = { cost: 500, budget: 400 };
  const pubsubData = {
    data: Buffer.from(JSON.stringify(jsonData)).toString('base64'),
    attributes: {}
  };

  await program.notifySlack(pubsubData, null);

  t.true(mocks.slack.chat.postMessage.calledOnce);
});

test(`should disable billing when budget is exceeded`, async t => {
  const { program, mocks } = getSample();

  const jsonData = { cost: 500, budget: 400 };
  const pubsubData = {
    data: Buffer.from(JSON.stringify(jsonData)).toString('base64'),
    attributes: {}
  };

  await program.stopBilling(pubsubData, null);

  t.true(mocks.credential.createScoped.calledOnce);
  t.true(mocks.cloudbilling.projects.getBillingInfo.calledOnce);
  t.true(mocks.cloudbilling.projects.updateBillingInfo.calledOnce);
});

test(`should shut down GCE instances when budget is exceeded`, async t => {
  const { program, mocks } = getSample();

  const jsonData = { cost: 500, budget: 400 };
  const pubsubData = {
    data: Buffer.from(JSON.stringify(jsonData)).toString('base64'),
    attributes: {}
  };

  await program.limitUse(pubsubData, null);

  t.true(mocks.credential.createScoped.calledOnce);
  t.true(mocks.compute.instances.list.calledOnce);
  t.is(mocks.compute.instances.stop.callCount, mocks.instanceList.length);
});
