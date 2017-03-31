// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

require(`../../../system-test/_setup`);

const childProcess = require('child_process');

const clientCmd = `node client.js`;
const serverCmd = `node server.js`;

const path = require('path');
const cwd = path.join(__dirname, `..`);

const API_KEY = process.env.ENDPOINTS_API_KEY;
const GCE_HOST = process.env.ENDPOINTS_GCE_HOST;
const GKE_HOST = process.env.ENDPOINTS_GKE_HOST;

const delay = (mSec) => {
  return new Promise((resolve) => setTimeout(resolve, mSec));
};

test(`should request a greeting from a remote Compute Engine instance`, async (t) => {
  const output = await runAsync(`${clientCmd} -h ${GCE_HOST} -k ${API_KEY}`, cwd);
  t.regex(output, /Hello world/);
});

test(`should request a greeting from a remote Container Engine cluster`, async (t) => {
  const output = await runAsync(`${clientCmd} -h ${GKE_HOST} -k ${API_KEY}`, cwd);
  t.regex(output, /Hello world/);
});

test(`should request and handle a greeting locally`, async (t) => {
  const PORT = 50051;
  const server = childProcess.exec(`${serverCmd} -p ${PORT}`, { cwd: cwd });

  await delay(1000);
  console.log(`${clientCmd} -h localhost:${PORT} -k ${API_KEY}`);
  const clientOutput = await runAsync(`${clientCmd} -h localhost:${PORT} -k ${API_KEY}`, cwd);
  t.regex(clientOutput, /Hello world/);
  server.kill();
});
