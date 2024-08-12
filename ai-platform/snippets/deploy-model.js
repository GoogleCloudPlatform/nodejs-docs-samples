/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

async function main(
  modelId,
  deployedModelDisplayName,
  endpointId,
  project,
  location = 'us-central1'
) {
  // [START aiplatform_deploy_model_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const modelId = "YOUR_MODEL_ID";
  // const endpointId = 'YOUR_ENDPOINT_ID';
  // const deployedModelDisplayName = 'YOUR_DEPLOYED_MODEL_DISPLAY_NAME';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  const modelName = `projects/${project}/locations/${location}/models/${modelId}`;
  const endpoint = `projects/${project}/locations/${location}/endpoints/${endpointId}`;
  // Imports the Google Cloud Endpoint Service Client library
  const {EndpointServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint:
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const endpointServiceClient = new EndpointServiceClient(clientOptions);

  async function deployModel() {
    // Configure the parent resource
    // key '0' assigns traffic for the newly deployed model
    // Traffic percentage values must add up to 100
    // Leave dictionary empty if endpoint should not accept any traffic
    const trafficSplit = {0: 100};
    const deployedModel = {
      // format: 'projects/{project}/locations/{location}/models/{model}'
      model: modelName,
      displayName: deployedModelDisplayName,
      automaticResources: {minReplicaCount: 1, maxReplicaCount: 1},
    };
    const request = {
      endpoint,
      deployedModel,
      trafficSplit,
    };

    // Get and print out a list of all the endpoints for this resource
    const [response] = await endpointServiceClient.deployModel(request);
    console.log(`Long running operation : ${response.name}`);

    // Wait for operation to complete
    await response.promise();
    const result = response.result;

    console.log('Deploy model response');
    const modelDeployed = result.deployedModel;
    console.log('\tDeployed model');
    if (!modelDeployed) {
      console.log('\t\tId : {}');
      console.log('\t\tModel : {}');
      console.log('\t\tDisplay name : {}');
      console.log('\t\tCreate time : {}');

      console.log('\t\tDedicated resources');
      console.log('\t\t\tMin replica count : {}');
      console.log('\t\t\tMachine spec {}');
      console.log('\t\t\t\tMachine type : {}');
      console.log('\t\t\t\tAccelerator type : {}');
      console.log('\t\t\t\tAccelerator count : {}');

      console.log('\t\tAutomatic resources');
      console.log('\t\t\tMin replica count : {}');
      console.log('\t\t\tMax replica count : {}');
    } else {
      console.log(`\t\tId : ${modelDeployed.id}`);
      console.log(`\t\tModel : ${modelDeployed.model}`);
      console.log(`\t\tDisplay name : ${modelDeployed.displayName}`);
      console.log(`\t\tCreate time : ${modelDeployed.createTime}`);

      const dedicatedResources = modelDeployed.dedicatedResources;
      console.log('\t\tDedicated resources');
      if (!dedicatedResources) {
        console.log('\t\t\tMin replica count : {}');
        console.log('\t\t\tMachine spec {}');
        console.log('\t\t\t\tMachine type : {}');
        console.log('\t\t\t\tAccelerator type : {}');
        console.log('\t\t\t\tAccelerator count : {}');
      } else {
        console.log(
          `\t\t\tMin replica count : \
            ${dedicatedResources.minReplicaCount}`
        );
        const machineSpec = dedicatedResources.machineSpec;
        console.log('\t\t\tMachine spec');
        console.log(`\t\t\t\tMachine type : ${machineSpec.machineType}`);
        console.log(
          `\t\t\t\tAccelerator type : ${machineSpec.acceleratorType}`
        );
        console.log(
          `\t\t\t\tAccelerator count : ${machineSpec.acceleratorCount}`
        );
      }

      const automaticResources = modelDeployed.automaticResources;
      console.log('\t\tAutomatic resources');
      if (!automaticResources) {
        console.log('\t\t\tMin replica count : {}');
        console.log('\t\t\tMax replica count : {}');
      } else {
        console.log(
          `\t\t\tMin replica count : \
            ${automaticResources.minReplicaCount}`
        );
        console.log(
          `\t\t\tMax replica count : \
            ${automaticResources.maxReplicaCount}`
        );
      }
    }
  }
  deployModel();
  // [END aiplatform_deploy_model_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
