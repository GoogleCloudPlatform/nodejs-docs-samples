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

async function main(modelId, project, location = 'us-central1') {
  // [START aiplatform_get_model_sample]
  /**
   * TODO(developer): Uncomment these variables before running the sample.\
   * (Not necessary if passing values as arguments)
   */

  // const modelId = 'YOUR_MODEL_ID';
  // const project = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION';

  // Imports the Google Cloud Model Service Client library
  const {ModelServiceClient} = require('@google-cloud/aiplatform');

  // Specifies the location of the api endpoint
  const clientOptions = {
    apiEndpoint: 'us-central1-aiplatform.googleapis.com',
  };

  // Instantiates a client
  const modelServiceClient = new ModelServiceClient(clientOptions);

  async function getModel() {
    // Configure the parent resource
    const name = `projects/${project}/locations/${location}/models/${modelId}`;
    const request = {
      name,
    };
    // Get and print out a list of all the endpoints for this resource
    const [response] = await modelServiceClient.getModel(request);

    console.log('Get model response');
    console.log(`\tName : ${response.name}`);
    console.log(`\tDisplayName : ${response.displayName}`);
    console.log(`\tDescription : ${response.description}`);
    console.log(`\tMetadata schema uri : ${response.metadataSchemaUri}`);
    console.log(`\tMetadata : ${JSON.stringify(response.metadata)}`);
    console.log(`\tTraining pipeline : ${response.trainingPipeline}`);
    console.log(`\tArtifact uri : ${response.artifactUri}`);
    console.log(
      `\tSupported deployment resource types : \
        ${response.supportedDeploymentResourceTypes}`
    );
    console.log(
      `\tSupported input storage formats : \
        ${response.supportedInputStorageFormats}`
    );
    console.log(
      `\tSupported output storage formats : \
        ${response.supportedOutputStoragFormats}`
    );
    console.log(`\tCreate time : ${JSON.stringify(response.createTime)}`);
    console.log(`\tUpdate time : ${JSON.stringify(response.updateTime)}`);
    console.log(`\tLabels : ${JSON.stringify(response.labels)}`);

    const predictSchemata = response.predictSchemata;
    console.log('\tPredict schemata');
    console.log(`\tInstance schema uri : ${predictSchemata.instanceSchemaUri}`);
    console.log(
      `\tParameters schema uri : ${predictSchemata.prametersSchemaUri}`
    );
    console.log(
      `\tPrediction schema uri : ${predictSchemata.predictionSchemaUri}`
    );

    const [supportedExportFormats] = response.supportedExportFormats;
    console.log('\tSupported export formats');
    console.log(`\t${supportedExportFormats}`);

    const containerSpec = response.containerSpec;
    console.log('\tContainer Spec');
    if (!containerSpec) {
      console.log(`\t\t${JSON.stringify(containerSpec)}`);
      console.log('\t\tImage uri : {}');
      console.log('\t\tCommand : {}');
      console.log('\t\tArgs : {}');
      console.log('\t\tPredict route : {}');
      console.log('\t\tHealth route : {}');
      console.log('\t\tEnv');
      console.log('\t\t\t{}');
      console.log('\t\tPort');
      console.log('\t\t{}');
    } else {
      console.log(`\t\t${JSON.stringify(containerSpec)}`);
      console.log(`\t\tImage uri : ${containerSpec.imageUri}`);
      console.log(`\t\tCommand : ${containerSpec.command}`);
      console.log(`\t\tArgs : ${containerSpec.args}`);
      console.log(`\t\tPredict route : ${containerSpec.predictRoute}`);
      console.log(`\t\tHealth route : ${containerSpec.healthRoute}`);
      const env = containerSpec.env;
      console.log('\t\tEnv');
      console.log(`\t\t\t${JSON.stringify(env)}`);
      const ports = containerSpec.ports;
      console.log('\t\tPort');
      console.log(`\t\t\t${JSON.stringify(ports)}`);
    }

    const [deployedModels] = response.deployedModels;
    console.log('\tDeployed models');
    console.log('\t\t', deployedModels);
  }
  getModel();
  // [END aiplatform_get_model_sample]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
