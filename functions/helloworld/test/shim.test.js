/**
 * Copyright 2018, Google, Inc.
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

const assert = require('assert');
const Supertest = require('supertest');
const tools = require('@google-cloud/nodejs-repo-tools');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const uuid = require('uuid');
const path = require('path');

const PORT = process.env.PORT || 3000;
const supertest = Supertest(`http://localhost:${PORT}`);
const topicName = `gcf-shim-topic-${uuid.v4()}`;
const subscriptionName = `gcf-shim-sub-${uuid.v4()}`;
const bucketName = `gcf-shim-bucket-${uuid.v4()}`;

const cmd = 'node shim.js';
const cwd = path.join(__dirname, '..');

const bucket = storage.bucket(bucketName);
let topic;
let subscription;

// Helper function
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Create test resources
before(() => {
  return bucket
    .create()
    .then(() => {
      return pubsub.createTopic(topicName);
    })
    .then(data => {
      topic = data[0];
      return topic.createSubscription(subscriptionName);
    })
    .then(data => {
      subscription = data[0];
      return delay(500);
    })
    .catch(console.error);
});

// Tear down test resources
after(() => {
  return bucket
    .deleteFiles({force: true})
    .then(subscription.delete())
    .then(topic.delete())
    .then(() => {
      try {
        return bucket.delete();
      } catch (ex) {
        return bucket.delete();
      }
    })
    .catch(console.error);
});

it('shim: should handle HTTP', async () => {
  const shim = tools.runAsync(`${cmd} http ${PORT}`, cwd);
  await delay(1000)
    .then(() => {
      // Send HTTP request
      return supertest
        .get('/helloGET')
        .expect(200)
        .expect(response => {
          assert.strictEqual(response.text, 'Hello World!');
        });
    })
    .then(() => {
      return shim;
    }); // Stop shim
});

it('shim: should handle PubSub', async () => {
  const name = uuid.v4();
  const publisher = topic.publisher();
  const shim = tools.runAsync(
    `${cmd} pubsub helloPubSub "${topicName}" "${subscriptionName}"`,
    cwd
  );

  // Publish to topic
  await publisher
    .publish(Buffer.from(name))
    .then(delay(1000))
    .then(() => {
      return shim;
    })
    .then(output => {
      assert.ok(output.includes(`Hello, ${name}!`));
    });
});

it('shim: should handle GCS', async () => {
  const shim = tools.runAsync(
    `${cmd} storage helloGCS "${bucketName}" "${topicName}" "${subscriptionName}"`,
    cwd
  );

  // Upload file to bucket
  await delay(10000)
    .then(() => {
      return bucket.upload(path.join(cwd, 'test/test.txt'));
    })
    .then(() => {
      return shim;
    })
    .then(output => {
      assert.ok(output.includes('File test.txt uploaded.'));
    });
});
