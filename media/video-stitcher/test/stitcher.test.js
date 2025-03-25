/**
 * Copyright 2022 Google LLC
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

const crypto = require('crypto');
const path = require('path');
const assert = require('assert');
const uuid = require('uuid');
const {execSync} = require('child_process');
const {describe, it, before, after} = require('mocha');

const bucketName = 'cloud-samples-data/media';
const vodFileName = 'hls-vod/manifest.m3u8';
const updatedVodFileName = 'hls-vod/manifest.mpd';
const liveFileName = 'hls-live/manifest.m3u8';

const projectId = process.env.GCLOUD_PROJECT;
const location = 'us-central1';
const slateIdPrefix = 'nodejs-test-slate';
const slateUri = `https://storage.googleapis.com/${bucketName}/ForBiggerEscapes.mp4`;
const updatedSlateUri = `https://storage.googleapis.com/${bucketName}/ForBiggerJoyrides.mp4`;

const akamaiCdnKeyIdPrefix = 'nodejs-test-akamai';
const mediaCdnKeyIdPrefix = 'nodejs-test-media';
const cloudCdnKeyIdPrefix = 'nodejs-test-cloud';

const updatedHostname = 'updated.cdn.example.com';

const cloudCdnPrivateKey = crypto.randomBytes(64).toString('base64');
const mediaCdnPrivateKey = crypto.randomBytes(64).toString('base64');
const akamaiTokenKey = crypto.randomBytes(64).toString('base64');

const updatedCloudCdnPrivateKey = crypto.randomBytes(64).toString('base64');
const updatedMediaCdnPrivateKey = crypto.randomBytes(64).toString('base64');
const updatedAkamaiTokenKey = crypto.randomBytes(64).toString('base64');

const liveConfigIdPrefix = 'nodejs-test-live-config';
const vodConfigIdPrefix = 'nodejs-test-vod-config';

const vodUri = `https://storage.googleapis.com/${bucketName}/${vodFileName}`;
const updatedVodUri = `https://storage.googleapis.com/${bucketName}/${updatedVodFileName}`;

// VMAP Pre-roll (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
const vodAdTagUri =
  "'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&correlator='";
const vodSessionPrefix = `/locations/${location}/vodSessions/`;

const liveUri = `https://storage.googleapis.com/${bucketName}/${liveFileName}`;
// Single Inline Linear (https://developers.google.com/interactive-media-ads/docs/sdks/html5/client-side/tags)
const liveAdTagUri =
  "'https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator='";
const liveSessionPrefix = `/locations/${location}/liveSessions/`;
let liveSessionLiveConfigId;
let vodSessionVodConfigId;

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

before(async () => {
  const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
  const ONE_HOUR_IN_SEC = 60 * 60 * 1;

  // Delete existing test slates more than an hour old.

  const slates = execSync(`node listSlates.js ${projectId} ${location}`, {cwd});

  slates
    .toString()
    .split(/\r?\n/)
    .forEach(line => {
      if (line.includes(`locations/${location}/slates/${slateIdPrefix}`)) {
        const nextId = line.split('/').pop();
        let createTime = nextId.split('-').pop();
        createTime = Number(createTime);
        if (
          isNaN(createTime) === false &&
          createTime < DATE_NOW_SEC - ONE_HOUR_IN_SEC
        ) {
          try {
            execSync(`node deleteSlate.js ${projectId} ${location} ${nextId}`, {
              cwd,
            });
          } catch (err) {
            if (err.message.includes('NOT_FOUND')) {
              // Ignore not found error
            } else {
              throw err; // re-throw the error unchanged
            }
          }
        }
      }
    });

  // Delete existing test VOD configs more than an hour old.
  const vodConfigs = execSync(
    `node listVodConfigs.js ${projectId} ${location}`,
    {cwd}
  );

  vodConfigs
    .toString()
    .split(/\r?\n/)
    .forEach(line => {
      if (
        line.includes(`locations/${location}/vodConfigs/${vodConfigIdPrefix}`)
      ) {
        const nextId = line.split('/').pop();
        let createTime = nextId.split('-').pop();
        createTime = Number(createTime);
        if (
          isNaN(createTime) === false &&
          createTime < DATE_NOW_SEC - ONE_HOUR_IN_SEC
        ) {
          try {
            execSync(
              `node deleteVodConfig.js ${projectId} ${location} ${nextId}`,
              {
                cwd,
              }
            );
          } catch (err) {
            if (err.message.includes('NOT_FOUND')) {
              // Ignore not found error
            } else {
              throw err; // re-throw the error unchanged
            }
          }
        }
      }
    });

  // Delete existing test live configs more than an hour old.
  const liveConfigs = execSync(
    `node listLiveConfigs.js ${projectId} ${location}`,
    {cwd}
  );

  liveConfigs
    .toString()
    .split(/\r?\n/)
    .forEach(line => {
      if (
        line.includes(`locations/${location}/liveConfigs/${liveConfigIdPrefix}`)
      ) {
        const nextId = line.split('/').pop();
        let createTime = nextId.split('-').pop();
        createTime = Number(createTime);
        if (
          isNaN(createTime) === false &&
          createTime < DATE_NOW_SEC - ONE_HOUR_IN_SEC
        ) {
          try {
            execSync(
              `node deleteLiveConfig.js ${projectId} ${location} ${nextId}`,
              {
                cwd,
              }
            );
          } catch (err) {
            if (err.message.includes('NOT_FOUND')) {
              // Ignore not found error
            } else {
              throw err; // re-throw the error unchanged
            }
          }
        }
      }
    });

  // Delete existing test CDN keys
  const keys = execSync(`node listCdnKeys.js ${projectId} ${location}`, {cwd});

  keys
    .toString()
    .split(/\r?\n/)
    .forEach(line => {
      if (
        line.includes(`locations/${location}/cdnKeys/${mediaCdnKeyIdPrefix}`) ||
        line.includes(`locations/${location}/cdnKeys/${cloudCdnKeyIdPrefix}`) ||
        line.includes(`locations/${location}/cdnKeys/${akamaiCdnKeyIdPrefix}`)
      ) {
        const nextId = line.split('/').pop();
        let createTime = nextId.split('-').pop();
        createTime = Number(createTime);
        if (
          isNaN(createTime) === false &&
          createTime < DATE_NOW_SEC - ONE_HOUR_IN_SEC
        ) {
          try {
            execSync(
              `node deleteCdnKey.js ${projectId} ${location} ${nextId}`,
              {
                cwd,
              }
            );
          } catch (err) {
            if (err.message.includes('NOT_FOUND')) {
              // Ignore not found error
            } else {
              throw err; // re-throw the error unchanged
            }
          }
        }
      }
    });
});

describe('Slate functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.slateId = `${slateIdPrefix}-${uuid.v4().substr(0, 8)}-${DATE_NOW_SEC}`;
    this.slateName = `/locations/${location}/slates/${this.slateId}`;
  });

  it('should create a slate', () => {
    const output = execSync(
      `node createSlate.js ${projectId} ${location} ${this.slateId} ${slateUri}`,
      {cwd}
    );
    assert.ok(output.includes(this.slateName));
  });

  it('should show a list of slates', () => {
    const output = execSync(`node listSlates.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(this.slateName));
  });

  it('should update a slate', () => {
    const output = execSync(
      `node updateSlate.js ${projectId} ${location} ${this.slateId} ${updatedSlateUri}`,
      {cwd}
    );
    assert.ok(output.includes(this.slateName));
    assert.ok(output.includes(updatedSlateUri));
  });

  it('should get a slate', () => {
    const output = execSync(
      `node getSlate.js ${projectId} ${location} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes(this.slateName));
  });

  it('should delete a slate', () => {
    const output = execSync(
      `node deleteSlate.js ${projectId} ${location} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted slate'));
  });
});

describe('Media CDN key functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.mediaCdnKeyId = `${mediaCdnKeyIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    this.mediaCdnKeyName = `/locations/${location}/cdnKeys/${this.mediaCdnKeyId}`;
  });

  it('should create a Media CDN key', () => {
    const output = execSync(
      `node createCdnKey.js ${projectId} ${this.mediaCdnKeyId} ${mediaCdnPrivateKey} true`,
      {cwd}
    );
    assert.ok(output.includes(this.mediaCdnKeyName));
  });

  it('should show a list of Media CDN keys', () => {
    const output = execSync(`node listCdnKeys.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(this.mediaCdnKeyName));
  });

  it('should update a Media CDN key', () => {
    const output = execSync(
      `node updateCdnKey.js ${projectId} ${this.mediaCdnKeyId} ${updatedHostname} ${updatedMediaCdnPrivateKey} true`,
      {cwd}
    );
    assert.ok(output.includes(this.mediaCdnKeyName));
    assert.ok(output.includes(updatedHostname));
  });

  it('should get a Media CDN key', () => {
    const output = execSync(
      `node getCdnKey.js ${projectId} ${location} ${this.mediaCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes(this.mediaCdnKeyName));
  });

  it('should delete a Media CDN key', () => {
    const output = execSync(
      `node deleteCdnKey.js ${projectId} ${location} ${this.mediaCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted CDN key'));
  });
});

describe('Cloud CDN key functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.cloudCdnKeyId = `${cloudCdnKeyIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    this.cloudCdnKeyName = `/locations/${location}/cdnKeys/${this.cloudCdnKeyId}`;
  });

  it('should show create aCloud CDN key', () => {
    const output = execSync(
      `node createCdnKey.js ${projectId} ${this.cloudCdnKeyId} ${cloudCdnPrivateKey} false`,
      {cwd}
    );
    assert.ok(output.includes(this.cloudCdnKeyName));
  });

  it('should show a list of Cloud CDN keys', () => {
    const output = execSync(`node listCdnKeys.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(this.cloudCdnKeyName));
  });

  it('should update a Cloud CDN key', () => {
    const output = execSync(
      `node updateCdnKey.js ${projectId} ${this.cloudCdnKeyId} ${updatedHostname} ${updatedCloudCdnPrivateKey} false`,
      {cwd}
    );
    assert.ok(output.includes(this.cloudCdnKeyName));
    assert.ok(output.includes(updatedHostname));
  });

  it('should get a Cloud CDN key', () => {
    const output = execSync(
      `node getCdnKey.js ${projectId} ${location} ${this.cloudCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes(this.cloudCdnKeyName));
  });

  it('should delete a Cloud CDN key', () => {
    const output = execSync(
      `node deleteCdnKey.js ${projectId} ${location} ${this.cloudCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted CDN key'));
  });
});

describe('Akamai CDN key functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.akamaiCdnKeyId = `${akamaiCdnKeyIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    this.akamaiCdnKeyName = `/locations/${location}/cdnKeys/${this.akamaiCdnKeyId}`;
  });

  it('should create an Akamai CDN key', () => {
    const output = execSync(
      `node createCdnKeyAkamai.js ${projectId} ${this.akamaiCdnKeyId} ${akamaiTokenKey}`,
      {cwd}
    );
    assert.ok(output.includes(this.akamaiCdnKeyName));
  });

  it('should show a list of Akamai CDN keys', () => {
    const output = execSync(`node listCdnKeys.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(this.akamaiCdnKeyName));
  });

  it('should update an Akamai CDN key', () => {
    const output = execSync(
      `node updateCdnKeyAkamai.js ${projectId} ${this.akamaiCdnKeyId} ${updatedHostname} ${updatedAkamaiTokenKey}`,
      {cwd}
    );
    assert.ok(output.includes(this.akamaiCdnKeyName));
    assert.ok(output.includes(updatedHostname));
  });

  it('should get an Akamai CDN key', () => {
    const output = execSync(
      `node getCdnKey.js ${projectId} ${location} ${this.akamaiCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes(this.akamaiCdnKeyName));
  });

  it('should delete an Akamai CDN key', () => {
    const output = execSync(
      `node deleteCdnKey.js ${projectId} ${location} ${this.akamaiCdnKeyId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted CDN key'));
  });
});

describe('Live config functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.slateId = `${slateIdPrefix}-${uuid.v4().substr(0, 8)}-${DATE_NOW_SEC}`;
    this.slateName = `/locations/${location}/slates/${this.slateId}`;

    const output = execSync(
      `node createSlate.js ${projectId} ${location} ${this.slateId} ${slateUri}`,
      {cwd}
    );
    assert.ok(output.includes(this.slateName));

    this.liveConfigId = `${liveConfigIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    this.liveConfigName = `/locations/${location}/liveConfigs/${this.liveConfigId}`;
  });

  after(() => {
    const output = execSync(
      `node deleteSlate.js ${projectId} ${location} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted slate'));
  });

  it('should create a live config', () => {
    const output = execSync(
      `node createLiveConfig.js ${projectId} ${location} ${this.liveConfigId} ${liveUri} ${liveAdTagUri} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes(this.liveConfigName));
  });

  it('should show a list of live configs', () => {
    const output = execSync(
      `node listLiveConfigs.js ${projectId} ${location}`,
      {cwd}
    );
    assert.ok(output.includes(this.liveConfigName));
  });

  it('should get a live config', () => {
    const output = execSync(
      `node getLiveConfig.js ${projectId} ${location} ${this.liveConfigId}`,
      {cwd}
    );
    assert.ok(output.includes(this.liveConfigName));
  });

  it('should delete a live config', () => {
    const output = execSync(
      `node deleteLiveConfig.js ${projectId} ${location} ${this.liveConfigId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted live config'));
  });
});

describe('VOD config functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.vodConfigId = `${vodConfigIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    this.vodConfigName = `/locations/${location}/vodConfigs/${this.vodConfigId}`;
  });

  it('should create a VOD config', () => {
    const output = execSync(
      `node createVodConfig.js ${projectId} ${location} ${this.vodConfigId} ${vodUri} ${vodAdTagUri}`,
      {cwd}
    );
    assert.ok(output.includes(this.vodConfigName));
  });

  it('should show a list of VOD configs', () => {
    const output = execSync(`node listVodConfigs.js ${projectId} ${location}`, {
      cwd,
    });
    assert.ok(output.includes(this.vodConfigName));
  });

  it('should update a VOD config', () => {
    const output = execSync(
      `node updateVodConfig.js ${projectId} ${location} ${this.vodConfigId} ${updatedVodUri}`,
      {cwd}
    );
    assert.ok(output.includes(this.vodConfigName));
    assert.ok(output.includes(updatedVodUri));
  });

  it('should get a VOD config', () => {
    const output = execSync(
      `node getVodConfig.js ${projectId} ${location} ${this.vodConfigId}`,
      {cwd}
    );
    assert.ok(output.includes(this.vodConfigName));
  });

  it('should delete a VOD config', () => {
    const output = execSync(
      `node deleteVodConfig.js ${projectId} ${location} ${this.vodConfigId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted VOD config'));
  });
});

describe('VOD session functions', () => {
  before(() => {
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);

    this.vodConfigId = `${vodConfigIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    vodSessionVodConfigId = this.vodConfigId;
    this.vodConfigName = `/locations/${location}/vodConfigs/${this.vodConfigId}`;

    const output = execSync(
      `node createVodConfig.js ${projectId} ${location} ${this.vodConfigId} ${vodUri} ${vodAdTagUri} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes(this.vodConfigName));
  });

  after(() => {
    const output = execSync(
      `node deleteVodConfig.js ${projectId} ${location} ${this.vodConfigId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted VOD config'));
  });

  it('should create a VOD session', () => {
    const output = execSync(
      `node createVodSession.js ${projectId} ${location} ${vodSessionVodConfigId}`,
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
    const DATE_NOW_SEC = Math.floor(Date.now() / 1000);
    this.slateId = `${slateIdPrefix}-${uuid.v4().substr(0, 8)}-${DATE_NOW_SEC}`;
    this.slateName = `/locations/${location}/slates/${this.slateId}`;

    let output = execSync(
      `node createSlate.js ${projectId} ${location} ${this.slateId} ${slateUri}`,
      {cwd}
    );
    assert.ok(output.includes(this.slateName));

    this.liveConfigId = `${liveConfigIdPrefix}-${uuid
      .v4()
      .substr(0, 8)}-${DATE_NOW_SEC}`;
    liveSessionLiveConfigId = this.liveConfigId;
    this.liveConfigName = `/locations/${location}/liveConfigs/${this.liveConfigId}`;

    output = execSync(
      `node createLiveConfig.js ${projectId} ${location} ${this.liveConfigId} ${liveUri} ${liveAdTagUri} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes(this.liveConfigName));
  });

  after(() => {
    let output = execSync(
      `node deleteLiveConfig.js ${projectId} ${location} ${this.liveConfigId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted live config'));

    output = execSync(
      `node deleteSlate.js ${projectId} ${location} ${this.slateId}`,
      {cwd}
    );
    assert.ok(output.includes('Deleted slate'));
  });

  it('should create and get a live session and list and get ad tag details', async function () {
    let output = execSync(
      `node createLiveSession.js ${projectId} ${location} ${liveSessionLiveConfigId}`,
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
