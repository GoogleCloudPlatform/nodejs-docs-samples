// Copyright 2021 Google LLC
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

/**
 * This module contains utility functions for removing unneeded, stale, or
 * orphaned resources from test project.
 *
 * Removes:
 * - Datasets
 * - Training pipelines
 * - Models
 * - Endpoints
 * - Batch prediction jobs
 */
const MAXIMUM_AGE = 3600000 * 24 * 2; // 2 days in milliseconds
const TEMP_RESOURCE_PREFIX = 'temp';
const LOCATION = 'us-central1';

// All AI Platform resources need to specify a hostname.
const clientOptions = {
  apiEndpoint: 'us-central1-aiplatform.googleapis.com',
};

/**
 * Determines whether a resource should be deleted based upon its
 * age and name.
 * @param {string} displayName the display name of the resource
 * @param {Timestamp} createTime when the resource is created
 * @returns {bool}
 */
function checkDeletionStatus(displayName, createTime) {
  const NOW = new Date();
  // Check whether this resources is a temporary resource
  if (displayName.indexOf(TEMP_RESOURCE_PREFIX) === -1) {
    return false;
  }

  // Check how old the resource is
  const ageOfResource = new Date(createTime.seconds * 1000);
  if (NOW - ageOfResource < MAXIMUM_AGE) {
    return false;
  }

  return true;
}

/**
 * Removes all temporary datasets older than the maximum age.
 * @param {string} projectId the project to remove datasets from
 * @returns {Promise}
 */
async function cleanDatasets(projectId) {
  const {DatasetServiceClient} = require('@google-cloud/aiplatform');
  const datasetServiceClient = new DatasetServiceClient(clientOptions);

  const [datasets] = await datasetServiceClient.listDatasets({
    parent: `projects/${projectId}/locations/${LOCATION}`,
  });

  for (const dataset of datasets) {
    const {displayName, createTime, name} = dataset;

    if (checkDeletionStatus(displayName, createTime)) {
      await datasetServiceClient.deleteDataset({
        name,
      });
    }
  }
}

/**
 * Removes all temporary training pipelines older than the maximum age.
 * @param {string} projectId the project to remove pipelines from
 * @returns {Promise}
 */
async function cleanTrainingPipelines(projectId) {
  const {PipelineServiceClient} = require('@google-cloud/aiplatform');
  const pipelineServiceClient = new PipelineServiceClient(clientOptions);

  const [pipelines] = await pipelineServiceClient.listTrainingPipelines({
    parent: `projects/${projectId}/locations/${LOCATION}`,
  });

  for (const pipeline of pipelines) {
    const {displayName, createTime, name} = pipeline;

    if (checkDeletionStatus(displayName, createTime)) {
      await pipelineServiceClient.deleteTrainingPipeline({
        name,
      });
    }
  }
}

/**
 * Removes all temporary models older than the maximum age.
 * @param {string} projectId the project to remove models from
 * @returns {Promise}
 */
async function cleanModels(projectId) {
  const {
    ModelServiceClient,
    EndpointServiceClient,
  } = require('@google-cloud/aiplatform');
  const modelServiceClient = new ModelServiceClient(clientOptions);

  const [models] = await modelServiceClient.listModels({
    parent: `projects/${projectId}/locations/${LOCATION}`,
  });

  for (const model of models) {
    const {displayName, createTime, deployedModels, name} = model;

    if (checkDeletionStatus(displayName, createTime)) {
      // Need to check if model is deployed to an endpoint
      // Undeploy the model everywhere it is deployed
      for (const deployedModel of deployedModels) {
        const {endpoint, deployedModelId} = deployedModel;

        const endpointServiceClient = new EndpointServiceClient(clientOptions);
        await endpointServiceClient.undeployModel({
          endpoint,
          deployedModelId,
        });
      }

      await modelServiceClient.deleteModel({
        name,
      });
    }
  }
}

/**
 * Removes all temporary endpoints older than the maximum age.
 * @param {string} projectId the project to remove endpoints from
 * @returns {Promise}
 */
async function cleanEndpoints(projectId) {
  const {EndpointServiceClient} = require('@google-cloud/aiplatform');
  const endpointServiceClient = new EndpointServiceClient(clientOptions);

  const [endpoints] = await endpointServiceClient.listEndpoints({
    parent: `projects/${projectId}/locations/${LOCATION}`,
  });

  for (const endpoint of endpoints) {
    const {displayName, createTime, name} = endpoint;

    // Rather than delete a deployed model from the endpoint,
    // allow the cleanModels() function undeploy those models.
    if (endpoint.deployedModels) {
      continue;
    }

    if (checkDeletionStatus(displayName, createTime)) {
      await endpointServiceClient.deleteEndpoint({
        name,
      });
    }
  }
}

/**
 * Removes all temporary batch prediction jobs
 * @param {string} projectId the project to remove prediction jobs from
 * @returns {Promise}
 */
async function cleanBatchPredictionJobs(projectId) {
  const {JobServiceClient} = require('@google-cloud/aiplatform');
  const jobServiceClient = new JobServiceClient(clientOptions);

  const [batchPredictionJobs] = await jobServiceClient.listBatchPredictionJobs({
    parent: `projects/${projectId}/locations/${LOCATION}`,
  });

  for (const job of batchPredictionJobs) {
    const {displayName, createTime, name} = job;
    if (checkDeletionStatus(displayName, createTime)) {
      await jobServiceClient.deleteBatchPredictionJob({
        name,
      });
    }
  }
}

/**
 * Removes all of the temporary resources older than the maximum age.
 * @param {string} projectId the project to remove resources from
 * @returns {Promise}
 */
async function cleanAll(projectId) {
  await cleanDatasets(projectId);
  await cleanTrainingPipelines(projectId);
  await cleanModels(projectId);
  await cleanEndpoints(projectId);
  await cleanBatchPredictionJobs(projectId);
}

module.exports = {
  cleanAll: cleanAll,
  cleanDatasets: cleanDatasets,
  cleanTrainingPipelines: cleanTrainingPipelines,
  cleanModels: cleanModels,
  cleanEndpoints: cleanEndpoints,
  cleanBatchPredictionJobs: cleanBatchPredictionJobs,
};
