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

'use strict';

const childProcess = require('child_process');
const path = require('path');
const assert = require('assert');
const fs = require(`fs`);
const jwt = require('jsonwebtoken');
const tools = require('@google-cloud/nodejs-repo-tools');
const delay = require('delay');

const clientCmd = `node client.js`;
const serverCmd = `node server.js`;

const cwd = path.join(__dirname, `..`);

const API_KEY = process.env.ENDPOINTS_API_KEY;
const GOOGLE_KEYFILE = JSON.parse(
  fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
);
const SERVICE_NAME = process.env.ENDPOINTS_SERVICE_NAME;
const GCE_HOST = process.env.ENDPOINTS_GCE_HOST;
const GKE_HOST = process.env.ENDPOINTS_GKE_HOST;

before(() => {
  assert.ok(API_KEY, 'Must set ENDPOINTS_API_KEY environment variable!');
  assert.ok(GCE_HOST, 'Must set ENDPOINTS_GCE_HOST environment variable!');
  assert.ok(GKE_HOST, 'Must set ENDPOINTS_GKE_HOST environment variable!');
  assert.ok(
    SERVICE_NAME,
    'Must set ENDPOINTS_SERVICE_NAME environment variable!'
  );
  assert.ok(
    GOOGLE_KEYFILE,
    'GOOGLE_APPLICATION_CREDENTIALS environment variable must point to a service account keyfile!'
  );
  assert.ok(
    GOOGLE_KEYFILE.client_email,
    'Service account keyfile must contain a "client_email" field!'
  );
  assert.ok(
    GOOGLE_KEYFILE.private_key,
    'Service account keyfile must contain a "private_key" field!'
  );
});

// Generate JWT based on GOOGLE_APPLICATION_CREDENTIALS and ENDPOINTS_SERVICE_NAME
const JWT_AUTH_TOKEN = jwt.sign(
  {
    aud: SERVICE_NAME,
    iss: GOOGLE_KEYFILE.client_email,
    iat: parseInt(Date.now() / 1000),
    exp: parseInt(Date.now() / 1000) + 20 * 60, // 20 minutes
    email: GOOGLE_KEYFILE.client_email,
    sub: GOOGLE_KEYFILE.client_email,
  },
  GOOGLE_KEYFILE.private_key,
  {algorithm: 'RS256'}
);

// API key
it(`should request a greeting from a remote Compute Engine instance using an API key`, async () => {
  const output = await tools.runAsync(
    `${clientCmd} -h ${GCE_HOST} -k ${API_KEY}`,
    cwd
  );
  assert.ok(new RegExp('Hello world').test(output));
});

it(`should request a greeting from a remote Container Engine cluster using an API key`, async () => {
  const output = await tools.runAsync(
    `${clientCmd} -h ${GKE_HOST} -k ${API_KEY}`,
    cwd
  );
  assert.ok(new RegExp('Hello world').test(output));
});

it('should request and handle a greeting locally using an API key', async () => {
  const PORT = 50051;
  const server = childProcess.exec(`${serverCmd} -p ${PORT}`, {cwd: cwd});

  await delay(1000);
  const clientOutput = await tools.runAsync(
    `${clientCmd} -h localhost:${PORT} -k ${API_KEY}`,
    cwd
  );
  assert.ok(new RegExp('Hello world').test(clientOutput));
  server.kill();
});

// Authtoken
it(`should request a greeting from a remote Compute Engine instance using a JWT Auth Token`, async () => {
  const output = await tools.runAsync(
    `${clientCmd} -h ${GCE_HOST} -j ${JWT_AUTH_TOKEN}`,
    cwd
  );
  assert.ok(new RegExp('Hello world').test(output));
});

it(`should request a greeting from a remote Container Engine cluster using a JWT Auth Token`, async () => {
  const output = await tools.runAsync(
    `${clientCmd} -h ${GKE_HOST} -j ${JWT_AUTH_TOKEN}`,
    cwd
  );
  assert.ok(new RegExp('Hello world').test(output));
});

it(`should request and handle a greeting locally using a JWT Auth Token`, async () => {
  const PORT = 50051;
  const server = childProcess.exec(`${serverCmd} -p ${PORT}`, {cwd: cwd});

  await delay(1000);
  const clientOutput = await tools.runAsync(
    `${clientCmd} -h localhost:${PORT} -j ${JWT_AUTH_TOKEN}`,
    cwd
  );
  assert.ok(new RegExp('Hello world').test(clientOutput));
  server.kill();
});

// Misc
it('should require either an API key or a JWT Auth Token', async () => {
  const {stderr} = await tools.runAsyncWithIO(
    `${clientCmd} -h ${GCE_HOST}`,
    cwd
  );
  assert.ok(stderr.includes('One of API_KEY or JWT_AUTH_TOKEN must be set'));
});
