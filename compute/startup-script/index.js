/**
 * Copyright 2018, Google, Inc.
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

const Compute = require('@google-cloud/compute');
const fetch = require('node-fetch');

const compute = new Compute();
const zone = compute.zone('us-central1-a');

/**
 * Create a new virtual machine with Ubuntu and Apache
 * @param {string} name Name of the virtual machine
 */
async function createVM(name) {
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
  console.log(metadata);

  // External IP of the VM.
  const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
  console.log(`Booting new VM with IP http://${ip}...`);

  // Ping the VM to determine when the HTTP server is ready.
  console.log(`Operation complete. Waiting for IP ...`);
  await pingVM(ip);

  console.log(`${name} created succesfully`);
  return ip;
}

/**
 * Poll a given IP address until it returns a result.
 * @param {string} ip IP address to poll
 */
async function pingVM(ip) {
  let waiting = true;
  while (waiting) {
    await new Promise(r => setTimeout(r, 2000));
    try {
      const res = await fetch(`http://${ip}`);
      const statusCode = res.status;
      if (statusCode === 200) {
        waiting = false;
        console.log('Ready!');
        return;
      } else {
        process.stdout.write('.');
      }
    } catch (err) {
      process.stdout.write('.');
    }
  }
}
/**
 * List all VMs and their external IPs in a given zone.
 */
async function listVMs() {
  const [vms] = await zone.getVMs();
  const results = await Promise.all(
    vms.map(async vm => {
      const [metadata] = await vm.getMetadata();
      return {
        ip: metadata['networkInterfaces'][0]['accessConfigs']
          ? metadata['networkInterfaces'][0]['accessConfigs'][0]['natIP']
          : 'no external ip',
        name: metadata.name,
      };
    })
  );
  console.log(results);
  return results;
}

/**
 * Delete a VM with a given name.
 * @param {string} name
 */
async function deleteVM(name) {
  const vm = zone.vm(name);
  console.log(`Deleting ${name} ...`);
  const [operation] = await vm.delete();
  console.log(`Polling operation ${operation.id} ...`);
  await operation.promise();
  console.log(`${name} deleted succesfully!`);
  return name;
}

module.exports = {
  createVM,
  deleteVM,
  listVMs,
};
