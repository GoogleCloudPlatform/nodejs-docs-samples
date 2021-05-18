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

const {FUNCTIONS_BUCKET} = process.env;

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid').v4;

const requestRetry = require('requestretry');
const cwd = path.join(__dirname, '..');

const exec = require('child-process-promise').exec;
const execPromise = cmd => exec(cmd, {shell: true, cwd});

const makeFFCmd = (target, port) => {
  // Run the functions-framework instance to host functions locally
  //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
  //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
  return `functions-framework --target=${target} --source chunked-http.js --port ${port} & sleep 2; kill -1 $!`;
};

describe('chunked http tests', () => {
  it('should upload file to GCS', async () => {
    const PORT = 9031; // Each running framework instance needs a unique port
    const fileId = uuidv4();

    // Run the functions-framework instance to host functions locally
    //   exec's 'timeout' param won't kill children of "shim" /bin/sh process
    //   Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
    const proc = execPromise(makeFFCmd('chunkedUpload', PORT));

    const uploadedFilepath = path.join(cwd, 'test/resources/cat.jpg');
    const response = await requestRetry({
      url: `http://localhost:${PORT}/?fileId=${fileId}`,
      method: 'POST',
      retryDelay: 200,
      headers: {'Content-Type': 'multipart/form-data'},
      formData: {
        file: {
          // Note: using a stream here results in socket issues
          // We use a buffer here as a workaround
          value: Buffer.from(fs.readFileSync(uploadedFilepath)),
          options: {
            filename: 'cat.jpg',
            contentType: 'image/jpeg',
          },
        },
      },
      maxAttempts: 3,
    });

    // Wait for functions-framework process to exit
    await proc;

    assert.strictEqual(response.statusCode, 200);
    const copiedFilename = `chunked-http-${fileId}-cat.jpg`;
    const [exists] = await storage
      .bucket(FUNCTIONS_BUCKET)
      .file(copiedFilename)
      .exists();

    assert.equal(exists, true); // Guard against true-vs-truthy failures
  });

  it('should download file', async () => {
    const PORT = 9032; // Each running framework instance needs a unique port

    const proc = execPromise(makeFFCmd('chunkedDownload', PORT));

    const response = await requestRetry({
      url: `http://localhost:${PORT}/`,
      method: 'GET',
      retryDelay: 200,
      json: true,
    });

    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.body, 'hello world!\n');

    // Wait for functions-framework process to exit
    await proc;
  });
});
