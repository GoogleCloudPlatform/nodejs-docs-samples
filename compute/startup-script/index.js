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
const http = require('http');

const compute = new Compute();

const zone = compute.zone('us-central1-a');

// callback(error, externalIp)
function createVm(name, callback) {
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

  vm
    .create(config)
    .then(data => {
      const operation = data[1];
      return operation.promise();
    })
    .then(() => {
      return vm.getMetadata();
    })
    .then(data => {
      const metadata = data[0];

      // External IP of the VM.
      const ip = metadata.networkInterfaces[0].accessConfigs[0].natIP;
      console.log(`Booting new VM with IP http://${ip}...`);

      // Ping the VM to determine when the HTTP server is ready.
      let waiting = true;
      const timer = setInterval(
        ip => {
          http
            .get('http://' + ip, res => {
              const statusCode = res.statusCode;
              if (statusCode === 200 && waiting) {
                waiting = false;
                clearTimeout(timer);
                // HTTP server is ready.
                console.log('Ready!');
                callback(null, ip);
              }
            })
            .on('error', () => {
              // HTTP server is not ready yet.
              process.stdout.write('.');
            });
        },
        2000,
        ip
      );
    })
    .catch(err => callback(err));
}

// List all VMs and their external IPs in a given zone.
// callback(error, [[name, ip], [name, ip], ...])
function listVms(callback) {
  zone
    .getVMs()
    .then(data => {
      const vms = data[0];
      let results = vms.map(vm => vm.getMetadata());
      return Promise.all(results);
    })
    .then(res =>
      callback(
        null,
        res.map(data => {
          return {
            ip: data[0]['networkInterfaces'][0]['accessConfigs']
              ? data[0]['networkInterfaces'][0]['accessConfigs'][0]['natIP']
              : 'no external ip',
            name: data[0].name,
          };
        })
      )
    )
    .catch(err => callback(err));
}

function deleteVm(name, callback) {
  const vm = zone.vm(name);
  vm
    .delete()
    .then(data => {
      console.log('Deleting ...');
      const operation = data[0];
      return operation.promise();
    })
    .then(() => {
      // VM deleted
      callback(null, name);
    })
    .catch(err => callback(err));
}

exports.create = (name, cb) => {
  createVm(name, cb);
};

exports.list = cb => {
  listVms(cb);
};

exports.delete = (name, cb) => {
  deleteVm(name, cb);
};
