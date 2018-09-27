/**
 * Copyright 2018, Google, LLC.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * This application demonstrates how to perform basic operations on dataset
 * with the Google AutoML Natural Language API.
 *
 * For more information, see the documentation at
 * https://cloud.google.com/natural-language/automl/docs/
 */

`use strict`;

function createModel(projectId, computeRegion, datasetId, modelName) {
  // [START automl_natural_language_createModel]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const datasetId = `Id of the dataset`;
  // const modelName = `Name of the model, e.g. "myModel"`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // Set model name and model metadata for the dataset.
  const myModel = {
    displayName: modelName,
    datasetId: datasetId,
    textClassificationModelMetadata: {},
  };

  // Create a model with the model metadata in the region.
  client
    .createModel({parent: projectLocation, model: myModel})
    .then(responses => {
      const operation = responses[0];
      const initialApiResponse = responses[1];

      console.log(`Training operation name: ${initialApiResponse.name}`);
      console.log(`Training started...`);
      return operation.promise();
    })
    .then(responses => {
      // The final result of the operation.
      const model = responses[0];

      // Retrieve deployment state.
      let deploymentState = ``;
      if (model.deploymentState === 1) {
        deploymentState = `deployed`;
      } else if (model.deploymentState === 2) {
        deploymentState = `undeployed`;
      }

      // Display the model information.
      console.log(`Model name: ${model.name}`);
      console.log(`Model id: ${model.name.split(`/`).pop(-1)}`);
      console.log(`Model display name: ${model.displayName}`);
      console.log(`Model create time:`);
      console.log(`\tseconds: ${model.createTime.seconds}`);
      console.log(`\tnanos: ${model.createTime.nanos}`);
      console.log(`Model deployment state: ${deploymentState}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_createModel]
}

function getOperationStatus(operationFullId) {
  // [START automl_natural_language_getOperationStatus]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const operationFullId = `Full name of an operation, eg. “Projects/<projectId>/locations/us-central1/operations/<operationId>
  // Get the latest state of a long-running operation.

  // Get the latest state of a long-running operation.
  client.operationsClient.getOperation(operationFullId).then(responses => {
    const response = responses[0];
    console.log(`Operation status: ${response}`);
  });
  // [END automl_natural_language_getOperationStatus]
}

function listModels(projectId, computeRegion, filter) {
  // [START automl_natural_language_listModels]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const filter_ = `filter expressions, must specify field, e.g. “imageClassificationModelMetadata:*”`;

  // A resource that represents Google Cloud Platform location.
  const projectLocation = client.locationPath(projectId, computeRegion);

  // List all the models available in the region by applying filter.
  if (filter === ``) filter = `textClassificationModelMetadata:*`;
  client
    .listModels({
      parent: projectLocation,
      filter: filter,
    })
    .then(responses => {
      const models = responses[0];

      // Display the model information.
      console.log(`List of models:`);
      models.forEach(model => {
        console.log(`Model name: ${model.name}`);
        console.log(`Model id: ${model.name.split(`/`).pop(-1)}`);
        console.log(`Model display name: ${model.displayName}`);
        console.log(`Model dataset id: ${model.datasetId}`);
        if (model.modelMetadata === `translationModelMetadata`) {
          console.log(`Translation model metadata:`);
          console.log(
            `\tBase model: ${model.translationModelMetadata.baseModel}`
          );
          console.log(
            `\tSource language code: ${
              model.translationModelMetadata.sourceLanguageCode
            }`
          );
          console.log(
            `\tTarget language code: ${
              model.translationModelMetadata.targetLanguageCode
            }`
          );
        } else if (model.modelMetadata === `textClassificationModelMetadata`) {
          console.log(
            `Text classification model metadata: ${
              model.textClassificationModelMetadata
            }`
          );
        } else if (model.modelMetadata === `imageClassificationModelMetadata`) {
          console.log(`Image classification model metadata:`);
          console.log(
            `\tBase model id: ${
              model.imageClassificationModelMetadata.baseModelId
            }`
          );
          console.log(
            `\tTrain budget: ${
              model.imageClassificationModelMetadata.trainBudget
            }`
          );
          console.log(
            `\tTrain cost: ${model.imageClassificationModelMetadata.trainCost}`
          );
          console.log(
            `\tStop reason: ${
              model.imageClassificationModelMetadata.stopReason
            }`
          );
        }
        console.log(`Model create time:`);
        console.log(`\tseconds: ${model.createTime.seconds}`);
        console.log(`\tnanos: ${model.createTime.nanos}`);
        console.log(`Model update time:`);
        console.log(`\tseconds: ${model.updateTime.seconds}`);
        console.log(`\tnanos: ${model.updateTime.nanos}`);
        console.log(`Model deployment state: ${model.deploymentState}`);
        console.log(`\n`);
      });
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_listModels]
}

function getModel(projectId, computeRegion, modelId) {
  // [START automl_natural_language_getModel]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Get complete detail of the model.
  client
    .getModel({name: modelFullId})
    .then(responses => {
      const model = responses[0];

      // Display the model information.
      console.log(`Model name: ${model.name}`);
      console.log(`Model id: ${model.name.split(`/`).pop(-1)}`);
      console.log(`Model display name: ${model.displayName}`);
      console.log(`Model dataset id: ${model.datasetId}`);
      if (model.modelMetadata === `translationModelMetadata`) {
        console.log(`Translation model metadata:`);
        console.log(
          `\tBase model: ${model.translationModelMetadata.baseModel}`
        );
        console.log(
          `\tSource language code: ${
            model.translationModelMetadata.sourceLanguageCode
          }`
        );
        console.log(
          `\tTarget language code: ${
            model.translationModelMetadata.targetLanguageCode
          }`
        );
      } else if (model.modelMetadata === `textClassificationModelMetadata`) {
        console.log(
          `Text classification model metadata: ${
            model.textClassificationModelMetadata
          }`
        );
      } else if (model.modelMetadata === `imageClassificationModelMetadata`) {
        console.log(`Image classification model metadata:`);
        console.log(
          `\tBase model id: ${
            model.imageClassificationModelMetadata.baseModelId
          }`
        );
        console.log(
          `\tTrain budget: ${
            model.imageClassificationModelMetadata.trainBudget
          }`
        );
        console.log(
          `\tTrain cost: ${model.imageClassificationModelMetadata.trainCost}`
        );
        console.log(
          `\tStop reason: ${model.imageClassificationModelMetadata.stopReason}`
        );
      }
      console.log(`Model create time:`);
      console.log(`\tseconds: ${model.createTime.seconds}`);
      console.log(`\tnanos: ${model.createTime.nanos}`);
      console.log(`Model update time:`);
      console.log(`\tseconds: ${model.updateTime.seconds}`);
      console.log(`\tnanos: ${model.updateTime.nanos}`);
      console.log(`Model deployment state: ${model.deploymentState}`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_getModel]
}

function listModelEvaluations(projectId, computeRegion, modelId, filter_) {
  // [START automl_natural_language_listModelEvaluations]
  const automl = require(`@google-cloud/automl`);
  const util = require(`util`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;
  // const filter_ = `filter expressions, must specify field, e.g. “imageClassificationModelMetadata:*”`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // List all the model evaluations in the model by applying filter.
  client
    .listModelEvaluations({parent: modelFullId, filter: filter_})
    .then(responses => {
      const elements = responses[0];
      console.log(`List of model evaluations:`);
      elements.forEach(element => {
        console.log(util.inspect(element, false, null));
      });
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_listModelEvaluations]
}

function getModelEvaluation(
  projectId,
  computeRegion,
  modelId,
  modelEvaluationId
) {
  // [START automl_natural_language_getModelEvaluation]
  const automl = require(`@google-cloud/automl`);
  const util = require(`util`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;
  // const modelEvaluationId = `Id of your model evaluation, e.g “ICN12345”

  // Get the full path of the model evaluation.
  const modelEvaluationFullId = client.modelEvaluationPath(
    projectId,
    computeRegion,
    modelId,
    modelEvaluationId
  );

  // Get complete detail of the model evaluation.
  client
    .getModelEvaluation({name: modelEvaluationFullId})
    .then(responses => {
      const response = responses[0];
      console.log(util.inspect(response, false, null));
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_getModelEvaluation]
}

function displayEvaluation(projectId, computeRegion, modelId, filter) {
  // [START automl_natural_language_displayEvaluation]
  const automl = require(`@google-cloud/automl`);
  const math = require(`mathjs`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;
  // const filter_ = `filter expressions, must specify field, e.g. “imageClassificationModelMetadata:*”`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // List all the model evaluations in the model by applying filter.
  client
    .listModelEvaluations({parent: modelFullId, filter: filter})
    .then(respond => {
      const response = respond[0];
      response.forEach(element => {
        // There is evaluation for each class in a model and for overall model.
        // Get only the evaluation of overall model.
        if (!element.annotationSpecId) {
          const modelEvaluationId = element.name.split(`/`).pop(-1);

          // Resource name for the model evaluation.
          const modelEvaluationFullId = client.modelEvaluationPath(
            projectId,
            computeRegion,
            modelId,
            modelEvaluationId
          );

          // Get a model evaluation.
          client
            .getModelEvaluation({name: modelEvaluationFullId})
            .then(responses => {
              const modelEvaluation = responses[0];

              const classMetrics =
                modelEvaluation.classificationEvaluationMetrics;

              const confidenceMetricsEntries =
                classMetrics.confidenceMetricsEntry;

              // Showing model score based on threshold of 0.5
              confidenceMetricsEntries.forEach(confidenceMetricsEntry => {
                if (confidenceMetricsEntry.confidenceThreshold === 0.5) {
                  console.log(
                    `Precision and recall are based on a score threshold of 0.5`
                  );
                  console.log(
                    `Model Precision: `,
                    math.round(confidenceMetricsEntry.precision * 100, 2) + `%`
                  );
                  console.log(
                    `Model Recall: `,
                    math.round(confidenceMetricsEntry.recall * 100, 2) + `%`
                  );
                  console.log(
                    `Model F1 score: `,
                    math.round(confidenceMetricsEntry.f1Score * 100, 2) + `%`
                  );
                  console.log(
                    `Model Precision@1: `,
                    math.round(confidenceMetricsEntry.precisionAt1 * 100, 2) +
                      `%`
                  );
                  console.log(
                    `Model Recall@1: `,
                    math.round(confidenceMetricsEntry.recallAt1 * 100, 2) + `%`
                  );
                  console.log(
                    `Model F1 score@1: `,
                    math.round(confidenceMetricsEntry.f1ScoreAt1 * 100, 2) + `%`
                  );
                }
              });
            })
            .catch(err => {
              console.error(err);
            });
        }
      });
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_displayEvaluation]
}

function deleteModel(projectId, computeRegion, modelId) {
  // [START automl_natural_language_deleteModel]
  const automl = require(`@google-cloud/automl`);

  const client = new automl.v1beta1.AutoMlClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const projectId = `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`;
  // const computeRegion = `region-name, e.g. "us-central1"`;
  // const modelId = `id of the model, e.g. “ICN12345”`;

  // Get the full path of the model.
  const modelFullId = client.modelPath(projectId, computeRegion, modelId);

  // Delete a model.
  client
    .deleteModel({name: modelFullId})
    .then(responses => {
      const operation = responses[0];
      return operation.promise();
    })
    .then(responses => {
      // The final result of the operation.
      if (responses[2].done === true) console.log(`Model deleted.`);
    })
    .catch(err => {
      console.error(err);
    });
  // [END automl_natural_language_deleteModel]
}

require(`yargs`)
  .demand(1)
  .options({
    computeRegion: {
      alias: `c`,
      type: `string`,
      default: process.env.REGION_NAME,
      requiresArg: true,
      description: `region name e.g. "us-central1"`,
    },
    datasetId: {
      alias: `i`,
      type: `string`,
      requiresArg: true,
      description: `Id of the dataset`,
    },
    filter: {
      alias: `f`,
      default: ``,
      type: `string`,
      requiresArg: true,
      description: `Name of the Dataset to search for`,
    },
    modelName: {
      alias: `m`,
      type: `string`,
      default: false,
      requiresArg: true,
      description: `Name of the model`,
    },
    modelId: {
      alias: `a`,
      type: `string`,
      default: ``,
      requiresArg: true,
      description: `Id of the model`,
    },
    modelEvaluationId: {
      alias: `e`,
      type: `string`,
      default: ``,
      requiresArg: true,
      description: `Id of the model evaluation`,
    },
    operationFullId: {
      alias: `o`,
      type: `string`,
      default: ``,
      requiresArg: true,
      description: `Full name of an operation`,
    },
    projectId: {
      alias: `z`,
      type: `number`,
      default: process.env.GCLOUD_PROJECT,
      requiresArg: true,
      description: `The GCLOUD_PROJECT string, e.g. "my-gcloud-project"`,
    },
    trainBudget: {
      alias: `t`,
      type: `string`,
      default: ``,
      requiresArg: true,
      description: `Budget for training the model`,
    },
  })
  .command(`create-model`, `creates a new Model`, {}, opts =>
    createModel(
      opts.projectId,
      opts.computeRegion,
      opts.datasetId,
      opts.modelName,
      opts.trainBudget
    )
  )
  .command(
    `get-operation-status`,
    `Gets status of current operation`,
    {},
    opts => getOperationStatus(opts.operationFullId)
  )
  .command(`list-models`, `list all Models`, {}, opts =>
    listModels(opts.projectId, opts.computeRegion, opts.filter)
  )
  .command(`get-model`, `Get a Model`, {}, opts =>
    getModel(opts.projectId, opts.computeRegion, opts.modelId)
  )
  .command(`list-model-evaluations`, `List model evaluations`, {}, opts =>
    listModelEvaluations(
      opts.projectId,
      opts.computeRegion,
      opts.modelId,
      opts.filter
    )
  )
  .command(`get-model-evaluation`, `Get model evaluation`, {}, opts =>
    getModelEvaluation(
      opts.projectId,
      opts.computeRegion,
      opts.modelId,
      opts.modelEvaluationId
    )
  )
  .command(`display-evaluation`, `Display evaluation`, {}, opts =>
    displayEvaluation(
      opts.projectId,
      opts.computeRegion,
      opts.modelId,
      opts.filter
    )
  )
  .command(`delete-model`, `Delete a Model`, {}, opts =>
    deleteModel(opts.projectId, opts.computeRegion, opts.modelId)
  )
  .example(`node $0 create-model -i "DatasetID" -m "myModelName" -t "2"`)
  .example(`node $0 get-operation-status -i "datasetId" -o "OperationFullID"`)
  .example(`node $0 list-models -f "textClassificationModelMetadata:*"`)
  .example(`node $0 get-model -a "ModelID"`)
  .example(`node $0 list-model-evaluations -a "ModelID"`)
  .example(`node $0 get-model-evaluation -a "ModelId" -e "ModelEvaluationID"`)
  .example(`node $0 display-evaluation -a "ModelId"`)
  .example(`node $0 delete-model -a "ModelID"`)
  .wrap(120)
  .recommendCommands()
  .help()
  .strict().argv;
