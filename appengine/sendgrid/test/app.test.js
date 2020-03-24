const assert = require('assert');
const path = require('path');
const supertest = require('supertest');
const proxyquire = require('proxyquire').noPreserveCache();

const cwd = path.join(__dirname, '../');
const request = supertest(proxyquire(path.join(cwd, 'app'), {process}));

describe('gae_flex_sendgrid', () => {
  it('GET /: should show homepage template', async () => {
    await request
      .get('/')
      .expect(200)
      .expect((response) => {
        assert(response.text.includes('Hello World!'));
      });
  });

  it('POST /hello: should send an email', async () => {
    await request
      .post('/hello?test=true')
      .type('form')
      .send({email: 'testuser@google.com'})
      .expect(200)
      .expect((response) => {
        assert(response.text.includes('Email sent!'));
      });
  });
});
