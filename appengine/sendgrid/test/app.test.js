const assert = require('assert');
const Supertest = require('supertest');
const supertest = Supertest('http://localhost:8080');

it('GET /: should show homepage template', async () => {
  await supertest
    .get('/')
    .expect(200)
    .expect(response => {
      assert(response.text.includes('Hello World!'));
    });
});

it('POST /hello: should send an email', async () => {
  await supertest
    .post('/hello?test=true')
    .type('form')
    .send({email: 'testuser@google.com'})
    .expect(200)
    .expect(response => {
      assert(response.text.includes('Email sent!'));
    });
});
