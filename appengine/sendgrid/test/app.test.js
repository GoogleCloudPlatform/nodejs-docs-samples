const assert = require('assert');
const path = require('path');
const utils = require('@google-cloud/nodejs-repo-tools');

const cwd = path.join(__dirname, '../');
const request = utils.getRequest({cwd: cwd});

it('GET /: should show homepage template', async () => {
  await request
    .get('/')
    .expect(200)
    .expect(response => {
      assert(response.text.includes('Hello World!'));
    });
});

it('POST /hello: should send an email', async () => {
  await request
    .post('/hello?test=true')
    .type('form')
    .send({email: 'testuser@google.com'})
    .expect(200)
    .expect(response => {
      assert(response.text.includes('Email sent!'));
    });
});
