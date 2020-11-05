const path = require('path');
const supertest = require('supertest');

let request;

describe('Unit Tests', () => {
  before(() => {
    const app = require(path.join(__dirname, '..', 'app'));
    request = supertest(app);
  });

  describe('should fail', () => {
    it('on a Bad Request with an empty payload', async () => {
      await request.post('/').type('json').send('').expect(400);
    });

    it('on a Bad Request with an invalid payload', async () => {
      await request
        .post('/')
        .type('json')
        .send({nomessage: 'invalid'})
        .expect(400);
    });

    it('on a Bad Request with an invalid mimetype', async () => {
      await request.post('/').type('text').send('{message: true}').expect(400);
    });

    it('if the decoded message.data is not well-formed JSON', async () => {
      await request
        .post('/')
        .type('json')
        .send({
          message: {
            data: 'non-JSON value',
          },
        })
        .expect(400);
    });

    describe('if name or bucket is missing from message.data, including', () => {
      it('missing both "name" and "bucket"', async () => {
        await request
          .post('/')
          .type('json')
          .send({
            message: {
              data: Buffer.from('{ "json": "value" }').toString('base64'),
            },
          })
          .expect(400);
      });
      it('missing just the "name" property', async () => {
        await request
          .post('/')
          .type('json')
          .send({
            message: {
              data: Buffer.from('{ "name": "value" }').toString('base64'),
            },
          })
          .expect(400);
      });
      it('missing just the "bucket" property', async () => {
        await request
          .post('/')
          .type('json')
          .send({
            message: {
              data: Buffer.from('{ "bucket": "value" }').toString('base64'),
            },
          })
          .expect(400);
      });
    });
  });
});

describe('Integration Tests', () => {
  it('Image analysis can proceed to Vision API scan', async () => {
    await request
      .post('/')
      .type('json')
      .send({
        message: {
          data: Buffer.from(
            '{ "bucket": "---", "name": "does-not-exist" }'
          ).toString('base64'),
        },
      })
      .expect(204);
  });
});
