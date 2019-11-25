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

// sample-metadata:
//  title: List VMs
//  usage: node listVMs

'use strict';

async function main() {
  // [START gce_list_vms]
  const Compute = require('@google-cloud/compute');
  const compute = new Compute();
  async function listVMs() {
    const vms = await compute.getVMs({
      maxResults: 10,
    });
    console.log(`Found ${vms.length} VMs!`);
    vms.forEach(vm => console.log(vm));
  }
  listVMs();
  // [END gce_list_vms]
}
main().catch(console.error);
