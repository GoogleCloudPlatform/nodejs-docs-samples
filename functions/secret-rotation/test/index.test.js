// Copyright 2017 Google LLC
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

'use strict';

const assert = require('assert');
const path = require('path');
const sinon = require('sinon');

const execPromise = require('child-process-promise').exec;
let requestRetry = require('requestretry');
requestRetry = requestRetry.defaults({
    retryStrategy: requestRetry.RetryStrategies.NetworkError,
    method: 'POST',
    json: true,
    retryDelay: 1000,
});

const cwd = path.join(__dirname, '..');

const PORT = 8080;
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const smClient = new SecretManagerServiceClient();

describe('functions/secret-rotation', () => {
    const stubConsole = function () {
        sinon.stub(console, `error`);
        sinon.stub(console, `log`);
    };

    const restoreConsole = function () {
        console.log.restore();
        console.error.restore();
    };
    beforeEach(stubConsole);
    afterEach(restoreConsole);

    let startFF, stopFF;

    before(async () => {
        startFF = (port) => {
            return execPromise(
                // exec's 'timeout' param won't kill children of "shim" /bin/sh process
                // Workaround: include "& sleep <TIMEOUT>; kill $!" in executed command
                `functions-framework --target=rotate --signature-type=event --port=${port} & sleep 3; kill $!`,
                { shell: true, cwd }
            );
        };

        stopFF = async (ffProc) => {
            return await ffProc;
        };

        // create the secret for use with rotation
        const [secret] = await smClient.createSecret({
            parent: `projects/${process.env.GOOGLE_CLOUD_PROJECT}`,
            secretId: process.env.SECRET_ID,
            secret: {
                replication: {
                    automatic: {},
                },
            },
        });

        console.log(`Created secret ${secret.name}`);
    });

    after(async () => {
        // delete secret
        await smClient.deleteSecret({
            name: process.env.SECRET_NAME,
        });

        console.log(`Deleted secret ${process.env.SECRET_NAME}`);
    });

    describe('functions_secret_rotate', async () => {
        it('rejects incorrect secrets', async () => {
            // secret name bad
            const ffProc = startFF(PORT);
            const response = await requestRetry({
                url: `http://localhost:${PORT}/rotate`,
                body: {
                    data: {
                        data: Buffer.from(`bad secret name`).toString('base64'),
                    }
                },
            });

            const { stdout, stderr } = await stopFF(ffProc);
            assert.ok(stderr.includes(`Ignoring. Expected rotation for`));
        });

        it('rotates secret', async () => {
            const ffProc = startFF(PORT);
            const response = await requestRetry({
                url: `http://localhost:${PORT}/rotate`,
                body: {
                    data: {
                        data: Buffer.from(process.env.SECRET_NAME).toString('base64'),
                    }
                },
            });

            const { stdout, stderr } = await stopFF(ffProc);
            assert.ok(stdout.includes(`Generating new secret`));
        });
    });
});
