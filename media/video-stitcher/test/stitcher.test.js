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

const uniqueId = uuidv4().split('-')[0];
const bucketName = 'cloud-samples-data/media';
const vodFileName = 'hls-vod/manifest.m3u8';
const liveFileName = 'hls-live/manifest.m3u8';

const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const slateIdPrefix = 'nodejs-test-stitcher-slate-';
const slateId = `${slateIdPrefix}${uniqueId}`;
const slateUri = `https://storage.googleapis.com/${bucketName}/ForBiggerEscapes.mp4`;
const slateName = `/locations/${location}/slates/${slateId}`;

const akamaiCdnKeyIdPrefix = 'nodejs-test-stitcher-akamai-key-';
const akamaiCdnKeyId = `${akamaiCdnKeyIdPrefix}${uniqueId}`;
const akamaiCdnKeyName = `/locations/${location}/cdnKeys/${akamaiCdnKeyId}`;
const googleCdnKeyIdPrefix = 'nodejs-test-stitcher-google-key-';
const googleCdnKeyId = `${googleCdnKeyIdPrefix}${uniqueId}`;
const googleCdnKeyName = `/locations/${location}/cdnKeys/${googleCdnKeyId}`;

const hostname = 'cdn.example.com';
const gCdnKeyname = 'gcdn-test-key';
const gCdnPrivateKey = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nLg==';
const akamaiTokenKey = 'VGhpcyBpcyBhIHRlc3Qgc3RyaW5nLg==';

const vodUri = `https://storage.googleapis.com/${bucketName}/${vodFileName}`;
// VMAP Pre-roll (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
const vodAdTagUri =
  "'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&correlator='";
const vodSessionPrefix = `/locations/${location}/vodSessions/`;

const liveUri = `https://storage.googleapis.com/${bucketName}/${liveFileName}`;
// Single Inline Linear (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
const liveAdTagUri =
  "'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='";
const liveSessionPrefix = `/locations/${location}/liveSessions/`;

const https = require('https');
const cwd = path.join(__dirname, '..');

async function getPage(url) {
  let data = '';
  return new Promise(resolve => {
    https.get(url, res => {
      res.on('data', chunk => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    });
  });
}

before(() => {
  // Delete existing test slates
  const slates = execSync(`node listSlates.js ${projectId} ${location}`, {cwd});

  slates
    .toString()
    .split(/\r?\n/)
    .forEach(line => {
      if (line.includes(`locations/${location}/slates/${slateIdPrefix}`)) {
        this.nextId = line.split('/').pop();
        execSync(
          `node deleteSlate.js ${projectId} ${location} ${this.nextId}`,
          {
            cwd,
          }
        );
      }
    });

  // Delete existing test CDN keys
  const keys = execSync(`node listCdnKeys.js ${projectId} ${location}`, {cwd});

  keys
    .toString()
    .split(/\r?\n/)
    .forEach(line => {
      if (
        line.includes(
          `locations/${location}/cdnKeys/${googleCdnKeyIdPrefix}`
        ) ||
        line.includes(`locations/${location}/cdnKeys/${akamaiCdnKeyIdPrefix}`)
      ) {
        this.nextId = line.split('/').pop();

        execSync(
          `node deleteCdnKey.js ${projectId} ${location} ${this.nextId}`,
          {
            cwd,
          }
        );
      }
    });
});

describe('Slate functions', () => {
  it('should create a slate', () => {
    const output = execSync(
      `node createSlate.js ${projectId} ${location} ${slateId} ${slateUri}`,
      {cwd}
    );
    assert.ok(output.includes(slateName));
  });

  it('should show a list of slates', () => {
    const output = execSync(`node listSlates.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(slateName));
  });

  it('should update a slate', () => {
    const output = execSync(
      `node updateSlate.js ${projectId} ${location} ${slateId} ${slateUri}`,
      {cwd}
    );
    assert.ok(output.includes(slateName));
  });

  it('should get a slate', () => {
    const output = execSync(
      `node getSlate.js ${projectId} ${location} ${slateId}`,
      {cwd}
    );
    assert.ok(output.includes(slateName));
  });

  it('should delete a slate', () => {
    const output = execSync(
      `node deleteSlate.js ${projectId} ${location} ${slateId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted slate'));
  });
});

describe('CDN key functions', () => {
  // Google CDN

  it('should create a Google CDN key', () => {
    const output = execSync(
      `node createCdnKey.js ${projectId} ${location} ${googleCdnKeyId} ${hostname} ${gCdnKeyname} ${gCdnPrivateKey} ''`,
      {cwd}
    );
    assert.ok(output.includes(googleCdnKeyName));
  });

  it('should show a list of CDN keys', () => {
    const output = execSync(`node listCdnKeys.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(googleCdnKeyName));
  });

  it('should update a Google CDN key', () => {
    const output = execSync(
      `node updateCdnKey.js ${projectId} ${location} ${googleCdnKeyId} ${hostname} ${gCdnKeyname} ${gCdnPrivateKey} ''`,
      {cwd}
    );
    assert.ok(output.includes(googleCdnKeyName));
  });

  it('should get a Google CDN key', () => {
    const output = execSync(
      `node getCdnKey.js ${projectId} ${location} ${googleCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes(googleCdnKeyName));
  });

  it('should delete a Google CDN key', () => {
    const output = execSync(
      `node deleteCdnKey.js ${projectId} ${location} ${googleCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted CDN key'));
  });

  // Akamai CDN

  it('should create an Akamai CDN key', () => {
    const output = execSync(
      `node createCdnKey.js ${projectId} ${location} ${akamaiCdnKeyId} ${hostname} '' '' ${akamaiTokenKey}`,
      {cwd}
    );
    assert.ok(output.includes(akamaiCdnKeyName));
  });

  it('should show a list of CDN keys', () => {
    const output = execSync(`node listCdnKeys.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(akamaiCdnKeyName));
  });

  it('should update an Akamai CDN key', () => {
    const output = execSync(
      `node updateCdnKey.js ${projectId} ${location} ${akamaiCdnKeyId} ${hostname} '' '' ${akamaiTokenKey}`,
      {cwd}
    );
    assert.ok(output.includes(akamaiCdnKeyName));
  });

  it('should get an Akamai CDN key', () => {
    const output = execSync(
      `node getCdnKey.js ${projectId} ${location} ${akamaiCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes(akamaiCdnKeyName));
  });

  it('should delete an Akamai CDN key', () => {
    const output = execSync(
      `node deleteCdnKey.js ${projectId} ${location} ${akamaiCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted CDN key'));
  });
});

describe('VOD session functions', () => {
  it('should create a VOD session', () => {
    const output = execSync(
      `node createVodSession.js ${projectId} ${location} ${vodUri} ${vodAdTagUri}`,
      {cwd}
    );
    assert.ok(output.includes(vodSessionPrefix));
    this.vodSessionId = output.toString().split('/').pop();
    this.vodSessionId = this.vodSessionId.replace(/\r?\n|\r/g, '');
  });

  it('should get a VOD session', () => {
    const output = execSync(
      `node getVodSession.js ${projectId} ${location} ${this.vodSessionId}`,
      {cwd}
    );
    assert.ok(output.includes(`${vodSessionPrefix}${this.vodSessionId}`));
  });

  // No list or delete methods for VOD sessions

  // Ad tag details

  it('should show a list of ad tag details for a VOD session', () => {
    const output = execSync(
      `node listVodAdTagDetails.js ${projectId} ${location} ${this.vodSessionId}`,
      {
        cwd,
      }
    );
    this.adTagDetailsNamePrefix = `${vodSessionPrefix}${this.vodSessionId}/vodAdTagDetails/`;
    assert.ok(output.includes(this.adTagDetailsNamePrefix));
    this.vodAdTagDetailsId = output.toString().split('/').pop();
    this.vodAdTagDetailsId = this.vodAdTagDetailsId.replace(/\r?\n|\r/g, '');
  });

  it('should get an ad tag detail', () => {
    const output = execSync(
      `node getVodAdTagDetail.js ${projectId} ${location} ${this.vodSessionId} ${this.vodAdTagDetailsId}`,
      {cwd}
    );
    assert.ok(
      output.includes(`${this.adTagDetailsNamePrefix}${this.vodAdTagDetailsId}`)
    );
  });

  // Stitch details

  it('should show a list of stitch details for a VOD session', () => {
    const output = execSync(
      `node listVodStitchDetails.js ${projectId} ${location} ${this.vodSessionId}`,
      {
        cwd,
      }
    );
    this.stitchDetailsNamePrefix = `${vodSessionPrefix}${this.vodSessionId}/vodStitchDetails/`;
    assert.ok(output.includes(this.stitchDetailsNamePrefix));
    this.stitchDetailsId = output.toString().split('/').pop();
    this.stitchDetailsId = this.stitchDetailsId.replace(/\r?\n|\r/g, '');
  });

  it('should get a stitch detail', () => {
    const output = execSync(
      `node getVodStitchDetail.js ${projectId} ${location} ${this.vodSessionId} ${this.stitchDetailsId}`,
      {cwd}
    );
    assert.ok(
      output.includes(`${this.stitchDetailsNamePrefix}${this.stitchDetailsId}`)
    );
  });
});

describe('Live session functions', () => {
  before(() => {
    // Delete the slate if it already exists
    try {
      execSync(`node deleteSlate.js ${projectId} ${location} ${slateId}`, {
        cwd,
      });
    } catch (err) {
      // Ignore not found error
    }
    execSync(
      `node createSlate.js ${projectId} ${location} ${slateId} ${slateUri}`,
      {cwd}
    );
  });

  after(() => {
    execSync(`node deleteSlate.js ${projectId} ${location} ${slateId}`, {cwd});
  });

  it('should create and get a live session and list and get ad tag details', async function () {
    let output = execSync(
      `node createLiveSession.js ${projectId} ${location} ${liveUri} ${liveAdTagUri} ${slateId}`,
      {cwd}
    );
    assert.ok(output.includes(liveSessionPrefix));

    let match = new RegExp('Live session:.(.*)', 'g').exec(output);
    this.liveSessionId = match[1].toString().split('/').pop();
    this.liveSessionId = this.liveSessionId.replace(/\r?\n|\r/g, '');
    match = new RegExp('Play URI:.(.*)', 'g').exec(output);
    this.playUri = match[1].replace(/\r?\n|\r/g, '');

    output = execSync(
      `node getLiveSession.js ${projectId} ${location} ${this.liveSessionId}`,
      {cwd}
    );
    assert.ok(output.includes(`${liveSessionPrefix}${this.liveSessionId}`));

    // No list or delete methods for live sessions

    // Ad tag details

    // To get ad tag details, you need to curl the main manifest and
    // a rendition first. This supplies media player information to the API.
    //
    // Curl the playUri first. The last line of the response will contain a
    // renditions location. Curl the live session name with the rendition
    // location appended.

    let data = await getPage(this.playUri);
    assert.ok(data.includes('renditions/'));

    match = new RegExp('renditions/.*', 'g').exec(data);
    this.renditions = match[0].replace(/\r?\n|\r/g, '');

    // playUri will be in the following format:
    // .../projects/{project}/locations/{location}/liveSessions/{session-id}/manifest.m3u8?signature=...
    // Replace manifest.m3u8?signature=... with the /renditions location.

    const arr = this.playUri.split('/');
    arr.pop();
    const str = arr.join('/');
    this.renditionsUrl = `${str}/${this.renditions}`;
    data = await getPage(this.renditionsUrl);

    output = execSync(
      `node listLiveAdTagDetails.js ${projectId} ${location} ${this.liveSessionId}`,
      {cwd}
    );
    this.liveAdTagDetailsNamePrefix = `${liveSessionPrefix}${this.liveSessionId}/liveAdTagDetails/`;
    assert.ok(output.includes(this.liveAdTagDetailsNamePrefix));
    this.liveAdTagDetailsId = output.toString().split('/').pop();
    this.liveAdTagDetailsId = this.liveAdTagDetailsId.replace(/\r?\n|\r/g, '');

    output = execSync(
      `node getLiveAdTagDetail.js ${projectId} ${location} ${this.liveSessionId} ${this.liveAdTagDetailsId}`,
      {cwd}
    );
    assert.ok(
      output.includes(
        `${this.liveAdTagDetailsNamePrefix}${this.liveAdTagDetailsId}`
      )
    );
  });
});
