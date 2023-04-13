// Copyright 2023 Google LLC
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

const waitPort = require('wait-port');
const {expect} = require('chai');
const PORT = parseInt(parseInt(process.env.PORT)) || 8080;
const childProcess = require('child_process');
const path = require('path');
const appPath = path.join(__dirname, '../app.js');

describe('server listening', () => {
  it('should be listening', async () => {
    const child = childProcess.exec(`node ${appPath}`);
    const returnObject = await waitPort({port: PORT});
    expect(returnObject.open).to.be.true;
    process.kill(child.pid, 'SIGTERM');
  });
});
