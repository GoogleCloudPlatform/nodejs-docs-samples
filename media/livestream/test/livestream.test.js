/**
 * Copyright 2023 Google LLC
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
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

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
const clipId = `nodejs-test-livestream-clip-${uniqueID}`;
const clipName = `projects/${projectId}/locations/${location}/channels/${channelId}/clips/${clipId}`;
const eventId = `nodejs-test-livestream-event-${uniqueID}`;
const eventName = `projects/${projectId}/locations/${location}/channels/${channelId}/events/${eventId}`;
const assetId = `nodejs-test-livestream-asset-${uniqueID}`;
const assetName = `projects/${projectId}/locations/${location}/assets/${assetId}`;
const assetUri = 'gs://cloud-samples-data/media/ForBiggerEscapes.mp4';
const outputUri = `gs://${bucketName}/test-output-channel/`;
const clipOutputUri = `${outputUri}clips`;
const poolId = 'default';
const poolName = `projects/${projectId}/locations/${location}/pools/${poolId}`;
const cwd = path.join(__dirname, '..');

let rtmpUri = '';

before(async () => {
  // Delete outstanding channels, inputs, and assets created more than 3 hours ago
  const {LivestreamServiceClient} = require('@google-cloud/livestream').v1;
  const livestreamServiceClient = new LivestreamServiceClient();
  const THREE_HOURS_IN_SEC = 60 * 60 * 3;
  const DATE_NOW_SEC = Math.floor(Date.now() / 1000);

  const [channels] = await livestreamServiceClient.listChannels({
    parent: livestreamServiceClient.locationPath(projectId, location),
  });
  for (const channel of channels) {
    if (channel.createTime.seconds < DATE_NOW_SEC - THREE_HOURS_IN_SEC) {
      const request = {
        name: channel.name,
      };
      try {
        const [operation] = await livestreamServiceClient.stopChannel(request);
        await operation.promise();
      } catch (err) {
        //Ignore error when channel is not started.
        console.log(
          'Existing channel already stopped. Ignore the following error.'
        );
        console.log(err);
      }

      const [events] = await livestreamServiceClient.listEvents({
        parent: channel.name,
      });

      for (const event of events) {
        await livestreamServiceClient.deleteEvent({
          name: event.name,
        });
      }

      const [clips] = await livestreamServiceClient.listClips({
        parent: channel.name,
      });

      for (const clip of clips) {
        await livestreamServiceClient.deleteClip({
          name: clip.name,
        });
      }

      await livestreamServiceClient.deleteChannel(request);
    }
  }

  const [inputs] = await livestreamServiceClient.listInputs({
    parent: livestreamServiceClient.locationPath(projectId, location),
  });
  for (const input of inputs) {
    if (input.createTime.seconds < DATE_NOW_SEC - THREE_HOURS_IN_SEC) {
      const request = {
        name: input.name,
      };
      await livestreamServiceClient.deleteInput(request);
    }
  }
  const [assets] = await livestreamServiceClient.listAssets({
    parent: livestreamServiceClient.locationPath(projectId, location),
  });
  for (const asset of assets) {
    if (asset.createTime.seconds < DATE_NOW_SEC - THREE_HOURS_IN_SEC) {
      const request = {
        name: asset.name,
      };
      await livestreamServiceClient.deleteAsset(request);
    }
  }
  // Create bucket for test files
  await storage.createBucket(bucketName);
});

after(async () => {
  async function deleteFiles() {
    const [files] = await storage.bucket(bucketName).getFiles();
    for (const file of files) {
      await storage.bucket(bucketName).file(file.name).delete();
    }
  }
  try {
    await deleteFiles();
    await storage.bucket(bucketName).delete();
  } catch (err) {
    console.log('Cannot delete bucket');
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

describe('Channel clip functions', () => {
  before(() => {
    let output = execSync(
      `node createInput.js ${projectId} ${location} ${inputId}`,
      {cwd}
    );
    assert.ok(output.includes(inputName));
    assert.ok(output.includes('Uri:'));

    const match = new RegExp('rtmp.*', 'g').exec(output);
    rtmpUri = match[0].trim();

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

  it('should create a channel clip', async () => {
    // Run the test stream for 45 seconds
    await execSync(
      `ffmpeg -re -f lavfi -t 45 -i "testsrc=size=1280x720 [out0]; sine=frequency=500 [out1]" \
        -acodec aac -vcodec h264 -f flv ${rtmpUri}`,
      {cwd}
    );

    const output = execSync(
      `node createChannelClip.js ${projectId} ${location} ${channelId} ${clipId} ${clipOutputUri}`,
      {cwd}
    );
    assert.ok(output.includes(clipName));
  });

  it('should show a list of channel clips', () => {
    const output = execSync(
      `node listChannelClips.js ${projectId} ${location} ${channelId}`,
      {cwd}
    );
    assert.ok(output.includes(clipName));
  });

  it('should get a channel clip', () => {
    const output = execSync(
      `node getChannelClip.js ${projectId} ${location} ${channelId} ${clipId}`,
      {cwd}
    );
    assert.ok(output.includes(clipName));
  });

  it('should delete a channel clip', () => {
    const output = execSync(
      `node deleteChannelClip.js ${projectId} ${location} ${channelId} ${clipId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted channel clip'));
  });
});

describe('Asset functions', () => {
  it('should create an asset', () => {
    const output = execSync(
      `node createAsset.js ${projectId} ${location} ${assetId} ${assetUri}`,
      {cwd}
    );
    assert.ok(output.includes(assetName));
  });

  it('should show a list of assets', () => {
    const output = execSync(`node listAssets.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(assetName));
  });

  it('should get an asset', () => {
    const output = execSync(
      `node getAsset.js ${projectId} ${location} ${assetId}`,
      {cwd}
    );
    assert.ok(output.includes(assetName));
  });

  it('should delete an asset', () => {
    const output = execSync(
      `node deleteAsset.js ${projectId} ${location} ${assetId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted asset'));
  });
});

describe('Pool functions', () => {
  it('should get a pool', () => {
    const output = execSync(
      `node getPool.js ${projectId} ${location} ${poolId}`,
      {cwd}
    );
    assert.ok(output.includes(poolName));
  });

  it('should update a pool', () => {
    const output = execSync(
      `node updatePool.js ${projectId} ${location} ${poolId} ''`,
      {cwd}
    );
    assert.ok(output.includes(poolName));
  });
});
