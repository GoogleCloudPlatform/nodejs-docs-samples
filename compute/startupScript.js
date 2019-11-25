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

async function main(name = 'start-script-example') {
  // [START gce_startup_script]
  const Compute = require('@google-cloud/compute');
  const fetch = require('node-fetch');

  const compute = new Compute();
  const zone = compute.zone('us-central1-c');

  // TODO(developer): choose a name for your virtual machine
  // const name = 'your-vm-name';

  /**
   * Create a new virtual machine with Ubuntu and Apache
   * @param {string} name Name of the virtual machine
   */
  async function createVMWithStartupScript() {
    // Create a new VM, using default ubuntu image. The startup script
    // installs apache and a custom homepage.
    const config = {
      os: 'ubuntu',
      http: true,
      metadata: {
        items: [
          {
            key: 'startup-script',
            value: `#! /bin/bash

              # Installs apache and a custom homepage
              apt-get update
              apt-get install -y apache2
              cat <<EOF > /var/www/html/index.html
              <!doctype html>
              <h1>Hello World</h1>
              <p>This page was created from a simple start-up script!</p>`,
          },
        ],
      },
    };

    const vm = zone.vm(name);

    console.log(`Creating VM ${name}...`);
    const [, operation] = await vm.create(config);

    console.log(`Polling operation ${operation.id}...`);
    await operation.promise();

    console.log('Acquiring VM metadata...');
    const [metadata] = await vm.getMetadata();

    // External IP of the VM.
    const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
    console.log(`Booting new VM with IP http://${ip}...`);

    // Ping the VM to determine when the HTTP server is ready.
    console.log('Operation complete. Waiting for IP');
    await pingVM(ip);

    console.log(`\n${name} created succesfully`);
  }

  /**
   * Poll a given IP address until it returns a result.
   * @param {string} ip IP address to poll
   */
  async function pingVM(ip) {
    let exit = false;
    while (!exit) {
      await new Promise(r => setTimeout(r, 2000));
      try {
        const res = await fetch(`http://${ip}`);
        if (res.status !== 200) {
          throw new Error(res.status);
        }
        exit = true;
      } catch (err) {
        process.stdout.write('.');
      }
    }
  }

  createVMWithStartupScript();
}

main(...process.argv.slice(2));
