const sinon = require('sinon');
const supertest = require('supertest');

const {getTestServer} = require('@google-cloud/functions-framework/testing');

beforeEach(() => {
  // require the module that includes the functions we are testing
  require('../index.js');

  // stub the console so we can use it for side effect assertions
  sinon.stub(console, 'log');
  sinon.stub(console, 'error');
});

afterEach(() => {
  // restore the console stub
  console.log.restore();
  console.error.restore();
});

describe('http function integration-tests', () => {
  it('should return hello world when both body and query are empty', async () => {
    const server = getTestServer('helloHttp');
    await supertest(server).post('/').send().expect(200).expect('Hello World!');
  });

  it('should return Hello John! when query string contains a name', async () => {
    const server = getTestServer('helloHttp');
    await supertest(server)
      .post('/?name=John')
      .send()
      .expect(200)
      .expect('Hello John!');
  });
  it('should return Hello John! when body contains a name', async () => {
    const server = getTestServer('helloHttp');
    await supertest(server)
      .post('/')
      .send({name: 'John'})
      .set('Content-Type', 'application/json')
      .expect(200)
      .expect('Hello John!');
  });
});
