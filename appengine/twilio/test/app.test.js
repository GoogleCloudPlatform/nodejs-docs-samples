// Copyright 2019 Google LLC
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
const Supertest = require('supertest');
const assert = require('assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();

process.env.TWILIO_NUMBER = '+15005550006';
process.env.TWILIO_ACCOUNT_SID = 'test';
process.env.TWILIO_AUTH_TOKEN = 'test';

const getSample = () => {
  const twilioMock = {
    messages: {
      create: sinon.stub().resolves(),
    },
  };
  const twilioVoiceRespMock = {
    say: sinon.stub().returns(),
  };
  const twilioMessagingRespMock = {
    message: sinon.stub().returns(),
  };

  const twilioStub = sinon.stub().returns(twilioMock);
  twilioStub.twiml = {
    VoiceResponse: sinon.stub().returns(twilioVoiceRespMock),
    MessagingResponse: sinon.stub().returns(twilioMessagingRespMock),
  };

  const {app} = proxyquire('../app', {twilio: twilioStub});

  return {
    supertest: Supertest(app, {
      twilio: twilioStub,
    }),
    mocks: {
      twilio: twilioMock,
      twilioVoiceRespMock: twilioVoiceRespMock,
      twilioMessagingRespMock: twilioMessagingRespMock,
    },
  };
};

describe('gae_flex_twilio_send_sms', () => {
  it('should send an SMS message', () => {
    const {supertest} = getSample();

    return supertest
      .get('/sms/send')
      .query({to: 1234})
      .expect(200)
      .expect(response => {
        assert.strictEqual(response.text, 'Message sent.');
      });
  });
});

describe('gae_flex_twilio_receive_sms', () => {
  it('should receive an SMS message', () => {
    const {supertest, mocks} = getSample();

    return supertest
      .post('/sms/receive')
      .send({From: 'Bob', Body: 'hi'})
      .type('form')
      .expect(200)
      .expect(() => {
        assert(
          mocks.twilioMessagingRespMock.message.calledWith(
            'Hello, Bob, you said: hi'
          )
        );
      });
  });
});

describe('gae_flex_twilio_receive_call', () => {
  it('should receive a call', () => {
    const {supertest, mocks} = getSample();

    return supertest
      .post('/call/receive')
      .send()
      .expect(200)
      .expect(() => {
        assert(
          mocks.twilioVoiceRespMock.say.calledWith(
            'Hello from Google App Engine.'
          )
        );
      });
  });
});
