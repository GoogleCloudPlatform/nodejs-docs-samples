// Copyright 2017, Google, Inc.
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

// sample-metadata:
//  title: Create VM
//  usage: node createVM <vmName>

'use strict';

async function main(
  vmName = 'new_virtual_machine' // VM name of your choice
) {
  // [START gce_create_vm]
  const Compute = require('@google-cloud/compute');
  const compute = new Compute();
  const zone = compute.zone('us-central1-c');

  async function createVM() {
    // TODO(developer): provide a name for your VM
    // const vmName = 'new-virutal-machine';
    const [vm, operation] = await zone.createVM(vmName, {os: 'ubuntu'});
    console.log(vm);
    await operation.promise();
    console.log('Virtual machine created!');
  }
  createVM();
  // [END gce_create_vm]
}

main(...process.argv.slice(2));
