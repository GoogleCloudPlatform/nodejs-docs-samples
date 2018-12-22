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

'use strict';

async function deleteVM(
  name = 'virtual_machine_name' // VM name of your choice
) {
  const Compute = require('@google-cloud/compute');
  const compute = new Compute();
  const zone = compute.zone('us-central1-c');
  const vm = zone.vm(name);
  const [operation] = await vm.delete();
  await operation.promise();
  console.log(`VM deleted!`);
}

deleteVM(...process.argv.slice(2)).catch(console.error);
