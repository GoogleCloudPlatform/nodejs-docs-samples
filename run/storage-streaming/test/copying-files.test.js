// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const {Storage} = require('@google-cloud/storage');
const storage = new Storage();

const assert = require('assert');
const path = require('path');
const uuidv4 = require('uuid').v4;
const requestRetry = require('requestretry');

const {FUNCTIONS_BUCKET} = process.env;
const cwd = path.join(__dirname, '..');

const exec = require('child-process-promise').exec;
const execPromise = cmd => exec(cmd, {shell: true, cwd});

const makeFFCmd = (target, port) => {
  // Run the functions-framework instance to host functions locally
  //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
  //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
  return `functions-framework \
            --target=${target} \
            --source copying-files.js \
            --port ${port} \
          & sleep 1; kill $!`;
};

describe('streaming sample tests', () => {
  it('should copy GCS file', async () => {
    const PORT = 9020; // Each running framework instance needs a unique port
    const suffix = uuidv4();

    const proc = execPromise(makeFFCmd('nonStreamingCall', PORT));

    const response = await requestRetry({
      url: `http://localhost:${PORT}/?suffix=${suffix}`,
      method: 'GET',
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 200);

    // Wait for functions-framework process to exit
    await proc;

    // Check that target file was written
    const copiedFilename = `puppies-copy-${suffix}.jpg`;
    assert(storage.bucket(FUNCTIONS_BUCKET).file(copiedFilename).exists);
  });

  it('should copy file GCS with streaming', async () => {
    const PORT = 9021; // Each running framework instance needs a unique port
    const suffix = uuidv4();

    // Run the functions-framework instance to host functions locally
    //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
    //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    const proc = execPromise(
      `functions-framework --target=streamingCall --port=${PORT} & sleep 1; kill $!`
    );

    const response = await requestRetry({
      url: `http://localhost:${PORT}/?suffix=${suffix}`,
      method: 'GET',
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 200);

    // Wait for functions-framework process to exit
    await proc;

    // Check that target file was written
    const copiedFilename = `puppies-streaming-copy-${suffix}.jpg`;
    assert(storage.bucket(FUNCTIONS_BUCKET).file(copiedFilename).exists);
  });
});
