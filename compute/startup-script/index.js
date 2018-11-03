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

async function createVm(name) {
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
  const vmObj = zone.vm(name);
  console.log('Creating VM ...');
  const [vm, operation] = await vmObj.create(config);
  await operation.promise();
  const [metadata] = await vm.getMetadata();

  // External IP of the VM.
  const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
  console.log(`Booting new VM with IP http://${ip}...`);

  // Ping the VM to determine when the HTTP server is ready.
  await pingVM(ip);
  return ip;
}

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
// List all VMs and their external IPs in a given zone.
async function listVms() {
  const [vms] = await zone.getVMs();
  return await Promise.all(
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
}

async function deleteVm(name) {
  const vm = zone.vm(name);
  console.log('Deleting ...');
  const [operation] = await vm.delete();
  await operation.promise();
  // VM deleted
  return name;
}

exports.create = async name => {
  const ip = await createVm(name);
  console.log(`${name} created succesfully`);
  return ip;
};

exports.list = async () => {
  const vms = await listVms();
  console.log(vms);
  return vms;
};

exports.delete = async name => {
  const result = await deleteVm(name);
  console.log(`${name} deleted succesfully`);
  return result;
};
