// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const assert = require('assert');
const got = require('got');
const {execSync} = require('child_process');
const {GoogleAuth} = require('google-auth-library');
const puppeteer = require('puppeteer');
const auth = new GoogleAuth();

describe('End-to-End Tests', () => {
  let BASE_URL, ID_TOKEN;
  // Retrieve Cloud Run service test config
  const {GOOGLE_CLOUD_PROJECT} = process.env;
  if (!GOOGLE_CLOUD_PROJECT) {
    throw Error('"GOOGLE_CLOUD_PROJECT" env var not found.');
  }
  let {SERVICE_NAME} = process.env;
  if (!SERVICE_NAME) {
    SERVICE_NAME = 'websocket';
    console.log(
      `"SERVICE_NAME" env var not found. Defaulting to "${SERVICE_NAME}"`
    );
  }
  const {SAMPLE_VERSION} = process.env;
  const PLATFORM = 'managed';
  const REGION = 'us-central1';
  let browser, browserPage;
  const {REDISHOST} = process.env;
  if (!REDISHOST) {
    throw Error('"REDISHOST" env var not found.');
  }
  before(async () => {
    // Deploy service using Cloud Build
    let buildCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_setup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION},_REDISHOST=${REDISHOST}`;
    if (SAMPLE_VERSION) buildCmd += `,_VERSION=${SAMPLE_VERSION}`;

    console.log('Starting Cloud Build...');
    execSync(buildCmd);
    console.log('Cloud Build completed.');

    // Retrieve URL of Cloud Run service
    const url = execSync(
      `gcloud run services describe ${SERVICE_NAME} --project=${GOOGLE_CLOUD_PROJECT} ` +
        `--platform=${PLATFORM} --region=${REGION} --format='value(status.url)'`
    );

    BASE_URL = url.toString('utf-8').trim();
    if (!BASE_URL) throw Error('Cloud Run service URL not found');

    // Retrieve ID token for testing
    const client = await auth.getIdTokenClient(BASE_URL);
    const clientHeaders = await client.getRequestHeaders();
    ID_TOKEN = clientHeaders['Authorization'].trim();
    if (!ID_TOKEN) throw Error('Unable to acquire an ID token.');

    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    browserPage = await browser.newPage();
  });

  after(() => {
    if (browser) {
      browser.close().then(() => console.log('closed.'))
    }

    let cleanUpCmd =
      `gcloud builds submit --project ${GOOGLE_CLOUD_PROJECT} ` +
      '--config ./test/e2e_test_cleanup.yaml ' +
      `--substitutions _SERVICE=${SERVICE_NAME},_PLATFORM=${PLATFORM},_REGION=${REGION}`;
    if (SAMPLE_VERSION) cleanUpCmd += `,_VERSION=${SAMPLE_VERSION}`;

    execSync(cleanUpCmd);
  });

  it('can be reached by an HTTP request', async () => {
    const options = {
      headers: {
        Authorization: ID_TOKEN,
      },
      method: 'GET',
      retry: 3,
    };
    const response = await got(BASE_URL, options);
    assert.strictEqual(response.statusCode, 200);
  });

  it('should process chat message', async () => {
    await browserPage.setExtraHTTPHeaders({
      Authorization: ID_TOKEN,
    });
    await browserPage.goto(BASE_URL, {
      waitUntil: 'networkidle2',
    });

    // Log in
    await browserPage.evaluate(() => {
      document.querySelector('#name').value = 'Sundar';
      document.querySelector('#room').value = 'Google';
      document.querySelector('.signin').click();
    });
    await new Promise(resolve => setTimeout(resolve, 100));

    // Send message
    await browserPage.evaluate(() => {
      document.querySelector('#msg').value = 'Welcome!';
      document.querySelector('.send').click();
    });
    await new Promise(resolve => setTimeout(resolve, 100));

    // Confirm message
    const list = await browserPage.$('#messages li');
    const itemText = await browserPage.evaluate(el => el.textContent, list);
    assert.strictEqual(itemText.trim(), 'Sundar: Welcome!');
    // Confirm room
    const room = await browserPage.$('#chatroom h1');
    const roomText = await browserPage.evaluate(el => el.textContent, room);
    assert.strictEqual(roomText, 'Google');
  });
});
