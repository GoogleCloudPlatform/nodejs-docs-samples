// Copyright 2020 Google LLC
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

'use strict';

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  modelId = 'YOUR_MODEL_ID'
) {
  // [START automl_vision_object_detection_deploy_model_node_count]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const modelId = 'YOUR_MODEL_ID';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require(`@google-cloud/automl`).v1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function deployModelWithNodeCount() {
    // Construct request
    const request = {
      name: client.modelPath(projectId, location, modelId),
      imageObjectDetectionModelDeploymentMetadata: {
        nodeCount: 2,
      },
    };

    const [operation] = await client.deployModel(request);

    // Wait for operation to complete.
    const [response] = await operation.promise();
    console.log(`Model deployment finished. ${response}`);
  }

  deployModelWithNodeCount();
  // [END automl_vision_object_detection_deploy_model_node_count]
}

main(...process.argv.slice(2));
