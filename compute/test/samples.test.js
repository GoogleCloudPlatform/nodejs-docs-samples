// Copyright 2018 Google LLC
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

const uuid = require('uuid');
const cp = require('child_process');
const {assert} = require('chai');
const Compute = require('@google-cloud/compute');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const compute = new Compute();

describe('samples', () => {
  describe('quickstart', () => {
    const name = `gcloud-ubuntu-${uuid.v4().split('-')[0]}`;
    after(async () => deleteVM(name));
    it('should run the quickstart', () => {
      const output = execSync(`node quickstart ${name}`);
      assert.match(output, /Virtual machine created!/);
    });
  });

  describe('lifecycle', () => {
    const name = `gcloud-ubuntu-${uuid.v4().split('-')[0]}`;

    it('should create a VM', () => {
      const output = execSync(`node createVM ${name}`);
      assert.match(output, /Virtual machine created!/);
    });

    it('should list the VMs', () => {
      const output = execSync('node listVMs');
      assert.match(output, /Found \d+ VMs!/);
    });

    it('should delete the VM', () => {
      const output = execSync(`node deleteVM ${name}`);
      assert.match(output, /VM deleted!/);
    });
  });

  describe('start-up script', () => {
    const name = `gcloud-apache-${uuid.v4().split('-')[0]}`;
    after(async () => deleteVM(name));
    it('should create vm with startup script', function (done) {
      this.timeout(280000);
      this.retries(3);
      const {spawn} = require('child_process');
      const startupScript = spawn('node', ['startupScript', name], {
        stdio: 'inherit',
      });
      startupScript.on('close', code => {
        assert.strictEqual(code, 0);
        return done();
      });
    });
  });
});

/**
 * Utility function to delete a VM.
 * @param {string} name
 */
async function deleteVM(name) {
  const zone = compute.zone('us-central1-c');
  const vm = zone.vm(name);
  const [operation] = await vm.delete();
  await operation.promise();
}
