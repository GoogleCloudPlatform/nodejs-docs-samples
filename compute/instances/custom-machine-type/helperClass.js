// Copyright 2022 Google LLC
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

/**
 * Creates an instance of CustoMachineTypeClass.
 *
 * @param {string} zone - Name of the zone you want to use, for example: us-west3-b
 * @param {string} cpuSeries - Type of CPU you want to use.
 * @param {int} coreCount - Number of CPU cores you want to use.
 * @param {int} memory - The amount of memory for the VM instance, in megabytes.
 */
function main(zone, cpuSeries, coreCount, memory) {
  // [START compute_custom_machine_type_helper_class]
  /**
   * TODO(developer): Uncomment and replace these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const zone = 'europe-central2-b';
  // const cpuSeries = 'N1';
  // const coreCount = 2
  // const memory = 256

  function range(from, to, step) {
    return [...Array(Math.floor((to - from) / step) + 1)].map(
      (_, i) => from + i * step
    );
  }

  class CustomMachineType {
    constructor(zone, cpuSeries, coreCount, memory) {
      this.zone = zone;
      this.cpuSeries = cpuSeries;
      this.coreCount = coreCount;
      this.memory = memory;

      this.N1 = 'custom';
      this.N2 = 'n2-custom';
      this.N2D = 'n2d-custom';
      this.E2 = 'e2-custom';
      this.E2Micro = 'e2-custom-micro';
      this.E2Small = 'e2-custom-small';
      this.E2Medium = 'e2-custom-medium';

      this.CpuSeriesE2Limit = {
        allowedCores: range(2, 33, 2),
        minMemPerCore: 512,
        maxMemPerCore: 8192,
        allowExtraMemory: false,
        extraMemoryLimit: 0,
      };

      this.CpuSeriesE2MicroLimit = {
        allowedCores: [],
        minMemPerCore: 1024,
        maxMemPerCore: 2048,
        allowExtraMemory: false,
        extraMemoryLimit: 0,
      };

      this.CpuSeriesE2SmallLimit = {
        allowedCores: [],
        minMemPerCore: 2048,
        maxMemPerCore: 4096,
        allowExtraMemory: false,
        extraMemoryLimit: 0,
      };

      this.CpuSeriesE2MediumLimit = {
        allowedCores: [],
        minMemPerCore: 4096,
        maxMemPerCore: 8192,
        allowExtraMemory: false,
        extraMemoryLimit: 0,
      };

      this.CpuSeriesN2Limit = {
        allowedCores: [...range(2, 33, 2), ...range(36, 129, 4)],
        minMemPerCore: 512,
        maxMemPerCore: 8192,
        allowExtraMemory: true,
        extraMemoryLimit: 624 << 10,
      };

      this.CpuSeriesN2DLimit = {
        allowedCores: [2, 4, 8, 16, 32, 48, 64, 80, 96],
        minMemPerCore: 512,
        maxMemPerCore: 8192,
        allowExtraMemory: true,
        extraMemoryLimit: 768 << 10,
      };

      this.CpuSeriesN1Limit = {
        allowedCores: [1, range(2, 97, 2)],
        minMemPerCore: 922,
        maxMemPerCore: 6656,
        allowExtraMemory: true,
        extraMemoryLimit: 624 << 10,
      };

      this.TYPE_LIMITS = {
        [this.N1]: this.CpuSeriesN1Limit,
        [this.N2]: this.CpuSeriesN2Limit,
        [this.N2D]: this.CpuSeriesN2DLimit,
        [this.E2]: this.CpuSeriesE2Limit,
        [this.E2Micro]: this.CpuSeriesE2MicroLimit,
        [this.E2Small]: this.CpuSeriesE2SmallLimit,
        [this.E2Medium]: this.CpuSeriesE2MediumLimit,
      };

      this.typeLimit = this.TYPE_LIMITS[this.cpuSeries];
    }

    validate() {
      // Check the number of cores
      if (
        this.typeLimit.allowedCores.length > 0 &&
        !this.typeLimit.allowedCores.includes(this.coreCount)
      ) {
        throw new Error(
          `Invalid number of cores requested. Allowed number of cores for ${this.cpuSeries} is: ${this.typeLimit.allowedCores}`
        );
      }

      // Memory must be a multiple of 256 MB
      if (this.memory % 256 !== 0) {
        throw new Error('Requested memory must be a multiple of 256 MB');
      }

      // Check if the requested memory isn't too little
      if (this.memory < this.coreCount * this.typeLimit.minMemPerCore) {
        throw new Error(
          `Requested memory is too low. Minimal memory for ${this.cpuSeries} is ${this.typeLimit.minMemPerCore} MB per core`
        );
      }

      // Check if the requested memory isn't too much
      if (
        this.memory > this.coreCount * this.typeLimit.maxMemPerCore &&
        !this.typeLimit.allowExtraMemory
      ) {
        throw new Error(
          `Requested memory is too large.. Maximum memory allowed for ${this.cpuSeries} is ${this.typeLimit.maxMemPerCore} MB per core`
        );
      }

      if (
        this.memory > this.typeLimit.extraMemoryLimit &&
        this.typeLimit.allowExtraMemory
      ) {
        throw new Error(
          `Requested memory is too large.. Maximum memory allowed for ${this.cpuSeries} is ${this.typeLimit.extraMemoryLimit} MB`
        );
      }
    }

    // Returns the custom machine type in form of a string acceptable by Compute Engine API.
    getMachineTypeURI() {
      if (
        [this.E2Small, this.E2Micro, this.E2Medium].includes(this.cpuSeries)
      ) {
        return `zones/${this.zone}/machineTypes/${this.cpuSeries}-${this.memory}`;
      }

      if (this.memory > this.coreCount * this.typeLimit.maxMemPerCore) {
        return `zones/${this.zone}/machineTypes/${this.cpuSeries}-${coreCount}-${this.memory}-ext`;
      }

      return `zones/${zone}/machineTypes/${this.cpuSeries}-${this.coreCount}-${this.memory}`;
    }

    // Returns machine type in a format without the zone. For example, n2-custom-0-10240.
    // This format is used to create instance templates.
    getMachineType() {
      return this.getMachineTypeURI().split('/').pop();
    }
  }

  async function createCustomMachineType() {
    if (
      [
        CustomMachineType.E2Small,
        CustomMachineType.E2Micro,
        CustomMachineType.E2Medium,
      ].includes(cpuSeries)
    ) {
      coreCount = 2;
    }

    const machineType = new CustomMachineType(
      zone,
      cpuSeries,
      coreCount,
      memory
    );

    console.log(`URI: ${machineType.getMachineTypeURI()}`);
    console.log(`MachineType: ${machineType.getMachineType()}`);
  }

  createCustomMachineType();
  // [END compute_custom_machine_type_helper_class]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

const args = process.argv.slice(2);
args[2] = parseInt(args[2]);
args[3] = parseInt(args[3]);

main(...args);
