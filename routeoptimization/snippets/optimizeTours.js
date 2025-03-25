// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(projectId) {
  // [START routeoptimization_optimize_tours_basic]
  const {RouteOptimizationClient} = require('@googlemaps/routeoptimization').v1;
  const routeoptimizationClient = new RouteOptimizationClient();

  async function callOptimizeTours() {
    const response = await routeoptimizationClient.optimizeTours({
      parent: `projects/${projectId}`,
      model: {
        shipments: [
          {
            deliveries: [
              {arrivalLocation: {latitude: 48.880942, longitude: 2.323866}},
            ],
          },
        ],
        vehicles: [
          {
            endLocation: {latitude: 48.86311, longitude: 2.341205},
            startLocation: {latitude: 48.863102, longitude: 2.341204},
          },
        ],
      },
    });
    return response;
  }
  // [END routeoptimization_optimize_tours_basic]

  console.log(JSON.stringify(await callOptimizeTours()));
}

main(...process.argv.slice(2));
