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

const Buffer = require('safe-buffer').Buffer;
const path = require('path');
const test = require(`ava`);
const tools = require(`@google-cloud/nodejs-repo-tools`);
const supertest = require(`supertest`);
const uuid = require(`uuid`);

const pubsub = require(`@google-cloud/pubsub`)();
const storage = require(`@google-cloud/storage`)();

const baseCmd = process.env.FUNCTIONS_CMD;
const topicName = process.env.FUNCTIONS_TOPIC;

const localFileName = `test.txt`;
const fileName = `test-${uuid.v4()}.txt`;

const BASE_URL = process.env.BASE_URL;

const bucketName = process.env.FUNCTIONS_BUCKET;
const bucket = storage.bucket(bucketName);

test.before(`Must specify BASE_URL`, t => {
  t.truthy(BASE_URL);
});

test.before(tools.checkCredentials);

test.cb(`helloGET: should print hello world`, (t) => {
  supertest(BASE_URL)
    .get(`/helloGET`)
    .expect(200)
    .expect((response) => {
      t.is(response.text, `Hello World!`);
    })
    .end(t.end);
});

test.cb(`helloHttp: should print a name via GET`, (t) => {
  supertest(BASE_URL)
    .get(`/helloHttp?name=John`)
    .expect(200)
    .expect((response) => {
      t.is(response.text, 'Hello John!');
    })
    .end(t.end);
});

test.cb(`helloHttp: should print a name via POST`, (t) => {
  supertest(BASE_URL)
    .post(`/helloHttp`)
    .send({ name: 'John' })
    .expect(200)
    .expect((response) => {
      t.is(response.text, 'Hello John!');
    })
    .end(t.end);
});

test.cb(`helloHttp: should print hello world`, (t) => {
  supertest(BASE_URL)
    .get(`/helloHttp`)
    .expect(200)
    .expect((response) => {
      t.is(response.text, `Hello World!`);
    })
    .end(t.end);
});

test.cb.serial(`helloHttp: should escape XSS`, (t) => {
  supertest(BASE_URL)
    .post(`/helloHttp`)
    .send({ name: '<script>alert(1)</script>' })
    .expect(200)
    .expect((response) => {
      t.false(response.text.includes('<script>'));
    })
    .end(t.end);
});

test(`helloBackground: should print a name`, async (t) => {
  const data = JSON.stringify({name: 'John'});
  const output = await tools.runAsync(`${baseCmd} call helloBackground --data '${data}'`);

  t.true(output.includes('Hello John!'));
});

test(`helloBackground: should print hello world`, async (t) => {
  const output = await tools.runAsync(`${baseCmd} call helloBackground --data '{}'`);

  t.true(output.includes('Hello World!'));
});

test(`helloPubSub: should print a name`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();
  const name = uuid.v4();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(name));

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`);
    assert(logs.includes(`Hello, ${name}!`));
  });
});

test(`helloPubSub: should print hello world`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(''), { a: 'b' });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloPubSub --start-time ${startTime}`);
    assert(logs.includes('Hello, World!'));
  });
});

test.serial(`helloGCS: should print uploaded message`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Upload file
  const filepath = path.join(__dirname, localFileName);
  await bucket.upload(filepath, {
    destination: fileName
  });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloGCS --start-time ${startTime}`);
    assert(logs.includes(`File ${fileName} uploaded`));
  });
});

test.serial(`helloGCS: should print metadata updated message`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Update file metadata
  await bucket.setMetadata(fileName, { foo: `bar` });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloGCS --start-time ${startTime}`);
    assert(logs.includes(`File ${fileName} metadata updated`));
  });
});

test.serial(`helloGCSGeneric: should print event details`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Update file metadata
  await bucket.setMetadata(fileName, { foo: `baz` });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloGCSGeneric --start-time ${startTime}`);
    assert(logs.includes(`Bucket: ${bucketName}`));
    assert(logs.includes(`File: ${fileName}`));
    assert(logs.includes(`Event type: google.storage.object.metadataUpdate`));
  });
});

test.serial(`helloGCS: should print deleted message`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Delete file
  bucket.deleteFiles();

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloGCS --start-time ${startTime}`);
    assert(logs.includes(`File ${fileName} deleted`));
  });
});

test(`helloError: should throw an error`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(''), { a: 'b' });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloError --start-time ${startTime}`);
    assert(logs.includes('Error: I failed you'));
  });
});

test(`helloError2: should throw a value`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(''), { a: 'b' });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloError2 --start-time ${startTime}`);
    assert(logs.includes(' 1\n'));
  });
});

test(`helloError3: callback should return an errback value`, async (t) => {
  t.plan(0);
  const startTime = new Date(Date.now()).toISOString();

  // Publish to pub/sub topic
  const topic = pubsub.topic(topicName);
  const publisher = topic.publisher();
  await publisher.publish(Buffer.from(''), { a: 'b' });

  // Check logs
  await tools.tryTest(async (assert) => {
    const logs = await tools.runAsync(`${baseCmd} logs read helloError3 --start-time ${startTime}`);
    assert(logs.includes(' I failed you\n'));
  });
});

test.cb(`helloTemplate: should render the html`, (t) => {
  supertest(BASE_URL)
    .get(`/helloTemplate`)
    .expect(200)
    .expect((response) => {
      t.regex(response.text, /<h1>Cloud Functions Template Sample<\/h1>/);
    })
    .end(t.end);
});
