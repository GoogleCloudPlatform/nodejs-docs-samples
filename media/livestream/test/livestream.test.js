/**
 * Copyright 2022, Google, Inc.
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

'use strict';

const path = require('path');
const assert = require('assert');
const {v4: uuidv4} = require('uuid');
const {execSync} = require('child_process');
const {describe, it, before, after} = require('mocha');

const uniqueID = uuidv4().split('-')[0];
const bucketName = `nodejs-samples-livestream-test-${uniqueID}`;

const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const inputId = `nodejs-test-livestream-input-${uniqueID}`;
const inputName = `projects/${projectId}/locations/${location}/inputs/${inputId}`;
const backupInputId = `nodejs-test-livestream-backup-input-${uniqueID}`;
const backupInputName = `projects/${projectId}/locations/${location}/inputs/${backupInputId}`;
const channelId = `nodejs-test-livestream-channel-${uniqueID}`;
const channelName = `projects/${projectId}/locations/${location}/channels/${channelId}`;
const eventId = `nodejs-test-livestream-event-${uniqueID}`;
const eventName = `projects/${projectId}/locations/${location}/channels/${channelId}/events/${eventId}`;
const outputUri = `gs://${bucketName}/test-output-channel/`;
const cwd = path.join(__dirname, '..');

before(async () => {
  // Stop the channel if it already exists
  try {
    execSync(`node stopChannel.js ${projectId} ${location} ${channelId}`, {
      cwd,
    });
  } catch (err) {
    // Ignore not found or not started error
  }

  // Delete the channel if it already exists
  try {
    execSync(`node deleteChannel.js ${projectId} ${location} ${channelId}`, {
      cwd,
    });
  } catch (err) {
    // Ignore not found error
  }

  // Delete the default input if it already exists
  try {
    execSync(`node deleteInput.js ${projectId} ${location} ${inputId}`, {
      cwd,
    });
  } catch (err) {
    // Ignore not found error
  }
});

after(async () => {
  // Delete outstanding channels and inputs created more than 3 days ago
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;
  const livestreamServiceClient = new LivestreamServiceClient();
  const THREE_DAYS_IN_SEC = 60 * 60 * 24 * 3;
  const DATE_NOW_SEC = Math.floor(Date.now() / 1000);

  const [channels] = await livestreamServiceClient.listChannels({
    parent: livestreamServiceClient.locationPath(projectId, location),
  });
  for (const channel of channels) {
    if (channel.createTime.seconds < DATE_NOW_SEC - THREE_DAYS_IN_SEC) {
      const request = {
        name: channel.name,
      };
      try {
        await livestreamServiceClient.stopChannel(request);
      } catch (err) {
        //Ignore error when channel is not started.
        console.log(err);
      }
      await livestreamServiceClient.deleteChannel(request);
    }
  }

  const [inputs] = await livestreamServiceClient.listInputs({
    parent: livestreamServiceClient.locationPath(projectId, location),
  });
  for (const input of inputs) {
    if (input.createTime.seconds < DATE_NOW_SEC - THREE_DAYS_IN_SEC) {
      const request = {
        name: input.name,
      };
      await livestreamServiceClient.deleteInput(request);
    }
  }
});

describe('Input functions', () => {
  it('should create an input', () => {
    const output = execSync(
      `node createInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(inputName));
  });

  it('should show a list of inputs', () => {
    const output = execSync(`node listInputs.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(inputName));
  });

  it('should update an input', () => {
    const output = execSync(
      `node updateInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(inputName));
  });

  it('should get an input', () => {
    const output = execSync(
      `node getInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(inputName));
  });

  it('should delete an input', () => {
    const output = execSync(
      `node deleteInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted input'));
  });
});

describe('Channel functions', () => {
  before(() => {
    const output = execSync(
      `node createInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(inputName));

    const output2 = execSync(
      `node createInput.js ${projectId} ${location} ${backupInputId}`,
      {cwd}
    );
    assert.ok(output2.includes(backupInputName));
  });

  after(() => {
    const output = execSync(
      `node deleteInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted input'));

    const output2 = execSync(
      `node deleteInput.js ${projectId} ${location} ${backupInputId}`,
      {cwd}
    );
    assert.ok(output2.includes('Deleted input'));
  });

  it('should create a channel', () => {
    const output = execSync(
      `node createChannel.js ${projectId} ${location} ${channelId} ${inputId} ${outputUri}`,
      {cwd}
    );
    assert.ok(output.includes(channelName));
  });

  it('should show a list of channels', () => {
    const output = execSync(`node listChannels.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(channelName));
  });

  it('should update an channel', () => {
    const output = execSync(
      `node updateChannel.js ${projectId} ${location} ${channelId} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(channelName));
  });

  it('should get an channel', () => {
    const output = execSync(
      `node getChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes(channelName));
  });

  it('should start a channel', () => {
    const output = execSync(
      `node startChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Started channel'));
  });

  it('should stop a channel', () => {
    const output = execSync(
      `node stopChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Stopped channel'));
  });

  it('should delete a channel', () => {
    const output = execSync(
      `node deleteChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted channel'));
  });

  it('should create a channel with backup input', () => {
    const output = execSync(
      `node createChannelWithBackupInput.js ${projectId} ${location} ${channelId} ${inputId} ${backupInputId} ${outputUri}`,
      {cwd}
    );
    assert.ok(output.includes(channelName));
  });

  it('should delete a channel with backup input', () => {
    const output = execSync(
      `node deleteChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted channel'));
  });
});

describe('Channel event functions', () => {
  before(() => {
    let output = execSync(
      `node createInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(inputName));

    output = execSync(
      `node createChannel.js ${projectId} ${location} ${channelId} ${inputId} ${outputUri}`,
      {cwd}
    );
    assert.ok(output.includes(channelName));

    output = execSync(
      `node startChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Started channel'));
  });

  after(() => {
    let output = execSync(
      `node stopChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Stopped channel'));

    output = execSync(
      `node deleteChannel.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted channel'));

    output = execSync(
      `node deleteInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted input'));
  });

  it('should create a channel event', () => {
    const output = execSync(
      `node createChannelEvent.js ${projectId} ${location} ${channelId} ${eventId}`,
      {cwd}
    );
    assert.ok(output.includes(eventName));
  });

  it('should show a list of channel events', () => {
    const output = execSync(
      `node listChannelEvents.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes(eventName));
  });

  it('should get a channel event', () => {
    const output = execSync(
      `node getChannelEvent.js ${projectId} ${location} ${channelId} ${eventId}`,
      {cwd}
    );
    assert.ok(output.includes(eventName));
  });

  it('should delete a channel event', () => {
    const output = execSync(
      `node deleteChannelEvent.js ${projectId} ${location} ${channelId} ${eventId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted channel event'));
  });
});
