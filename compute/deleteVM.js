// Copyright 2020, Google, Inc.
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
//  title: Delete VM
//  usage: node deleteVM <vmName>

'use strict';

async function main(
  name = 'virtual_machine_name' // VM name of your choice
) {
  // [START gce_delete_vm]
  const Compute = require('@google-cloud/compute');

  async function deleteVM() {
    const compute = new Compute();
    const zone = compute.zone('us-central1-c');
    // TODO(developer): choose a name for the VM to delete
    // const name = 'vm-name';
    const vm = zone.vm(name);
    const [operation] = await vm.delete();
    await operation.promise();
    console.log('VM deleted!');
  }
  deleteVM();
  // [END gce_delete_vm]
}

main(...process.argv.slice(2));
