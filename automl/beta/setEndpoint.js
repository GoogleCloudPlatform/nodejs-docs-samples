// Copyright 2019 Google LLC
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

async function setEndpoint(projectId) {
  // [START automl_set_endpoint]
  const automl = require('@google-cloud/automl').v1beta1;

  // You must first create a dataset, using the `eu` endpoint, before you can
  // call other operations such as: list, get, import, delete, etc.
  const clientOptions = {apiEndpoint: 'eu-automl.googleapis.com'};

  // Instantiates a client
  const client = new automl.AutoMlClient(clientOptions);

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, 'eu');
  // [END automl_set_endpoint]

  // Grabs the list of datasets in a given project location.
  // Note: create a dataset in `eu` before calling `listDatasets`.
  const responses = await client.listDatasets({parent: projectLocation});

  // Prints out each dataset.
  const datasets = responses[0];
  datasets.forEach(dataset => {
    console.log(dataset);
  });
}

setEndpoint(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
