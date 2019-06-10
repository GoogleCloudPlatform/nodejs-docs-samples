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

const {Buffer} = require('safe-buffer');
const path = require('path');
const assert = require('assert');
const tools = require('@google-cloud/nodejs-repo-tools');
const supertest = require('supertest');
const uuid = require('uuid');

const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const baseCmd = process.env.FUNCTIONS_CMD;
const topicName = process.env.FUNCTIONS_TOPIC;

const localFileName = 'test.txt';
const fileName = `test-${uuid.v4()}.txt`;

const {BASE_URL} = process.env;

const bucketName = process.env.FUNCTIONS_BUCKET;
const bucket = storage.bucket(bucketName);

before('Must specify BASE_URL', () => {
  assert.ok(BASE_URL);
  tools.checkCredentials();
});

it('helloGET: should print hello world', async () => {
  await supertest(BASE_URL)
    .get('/helloGET')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello World!');
    });
});

it('helloHttp: should print a name via GET', async () => {
  await supertest(BASE_URL)
    .get('/helloHttp?name=John')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello John!');
    });
});

it('helloHttp: should print a name via POST', async () => {
  await supertest(BASE_URL)
    .post('/helloHttp')
    .send({name: 'John'})
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello John!');
    });
});

it('helloHttp: should print hello world', async () => {
  await supertest(BASE_URL)
    .get('/helloHttp')
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text, 'Hello World!');
    });
});

it('helloHttp: should escape XSS', async () => {
  await supertest(BASE_URL)
    .post('/helloHttp')
    .send({name: '<script>alert(1)</script>'})
    .expect(200)
    .expect(response => {
      assert.strictEqual(response.text.includes('<script>'), false);
    });
});

it.only('helloBackground: should print a name', async () => {
  const data = JSON.stringify({name: 'John'});
  const output = await tools.runAsync(
    `${baseCmd} call helloBackground --data '${data}'`
  );

  assert.strictEqual(output.includes('Hello John!'), true);
});

it('helloBackground: should print hello world', async () => {
  const output = await tools.runAsync(
    `${baseCmd} call helloBackground --data '{}'`
  );

  assert.strictEqual(output.includes('Hello World!'), true);
});

it('helloPubSub: should print a name', async () => {
  const startTime = new Date(Date.now()).toISOString();
  const name = uuid.v4();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(name));

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloPubSub --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes(`Hello, ${name}!`), true);
  });
});

it('helloPubSub: should print hello world', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(''), {a: 'b'});

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloPubSub --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes('Hello, World!'), true);
  });
});

it('helloGCS: should print uploaded message', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Upload file
  const filepath = path.join(__dirname, localFileName);
  await bucket.upload(filepath, {
    destination: fileName,
  });

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloGCS --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes(`File ${fileName} uploaded`), true);
  });
});

it('helloGCS: should print metadata updated message', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Update file metadata
  await bucket.setMetadata(fileName, {foo: 'bar'});

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloGCS --start-time ${startTime}`
    );
    assert.strictEqual(
      logs.includes(`File ${fileName} metadata updated`),
      true
    );
  });
});

it('helloGCSGeneric: should print event details', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Update file metadata
  await bucket.setMetadata(fileName, {foo: 'baz'});

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloGCSGeneric --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes(`Bucket: ${bucketName}`), true);
    assert.strictEqual(logs.includes(`File: ${fileName}`), true);
    assert.strictEqual(
      logs.includes('Event type: google.storage.object.metadataUpdate'),
      true
    );
  });
});

it('helloGCS: should print deleted message', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Delete file
  bucket.deleteFiles();

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloGCS --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes(`File ${fileName} deleted`), true);
  });
});

it('helloError: should throw an error', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(''), {a: 'b'});

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloError --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes('Error: I failed you'), true);
  });
});

it('helloError2: should throw a value', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(''), {a: 'b'});

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloError2 --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes(' 1\n'), true);
  });
});

it('helloError3: callback should return an errback value', async () => {
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  await topic.publish(Buffer.from(''), {a: 'b'});

  // Check logs
  await tools.tryTest(async assert => {
    const logs = await tools.runAsync(
      `${baseCmd} logs read helloError3 --start-time ${startTime}`
    );
    assert.strictEqual(logs.includes(' I failed you\n'), true);
  });
});

it('helloTemplate: should render the html', async () => {
  await supertest(BASE_URL)
    .get('/helloTemplate')
    .expect(200)
    .expect(response => {
      assert.strictEqual(
        new RegExp(/<h1>Cloud Functions Template Sample<\/h1>/).test(
          response.text
        ),
        true
      );
    });
});
