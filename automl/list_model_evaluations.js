// Copyright 2020 Google LLC
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

function main(
  projectId = 'YOUR_PROJECT_ID',
  location = 'us-central1',
  modelId = 'YOUR_MODEL_ID'
) {
  // [START automl_language_entity_extraction_list_model_evaluations]
  // [START automl_language_sentiment_analysis_list_model_evaluations]
  // [START automl_language_text_classification_list_model_evaluations]
  // [START automl_translate_list_model_evaluations]
  // [START automl_vision_classification_list_model_evaluations]
  // [START automl_vision_object_detection_list_model_evaluations]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const modelId = 'YOUR_MODEL_ID';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function listModelEvaluations() {
    // Construct request
    const request = {
      parent: client.modelPath(projectId, location, modelId),
      filter: '',
    };

    const [response] = await client.listModelEvaluations(request);

    console.log('List of model evaluations:');
    for (const evaluation of response) {
      console.log(`Model evaluation name: ${evaluation.name}`);
      console.log(`Model annotation spec id: ${evaluation.annotationSpecId}`);
      console.log(`Model display name: ${evaluation.displayName}`);
      console.log('Model create time');
      console.log(`\tseconds ${evaluation.createTime.seconds}`);
      console.log(`\tnanos ${evaluation.createTime.nanos / 1e9}`);
      console.log(
        `Evaluation example count: ${evaluation.evaluatedExampleCount}`
      );
      // [END automl_language_sentiment_analysis_list_model_evaluations]
      // [END automl_language_text_classification_list_model_evaluations]
      // [END automl_translate_list_model_evaluations]
      // [END automl_vision_classification_list_model_evaluations]
      // [END automl_vision_object_detection_list_model_evaluations]
      console.log(
        `Entity extraction model evaluation metrics: ${evaluation.textExtractionEvaluationMetrics}`
      );
      // [END automl_language_entity_extraction_list_model_evaluations]

      // [START automl_language_sentiment_analysis_list_model_evaluations]
      console.log(
        `Sentiment analysis model evaluation metrics: ${evaluation.textSentimentEvaluationMetrics}`
      );
      // [END automl_language_sentiment_analysis_list_model_evaluations]

      // [START automl_language_text_classification_list_model_evaluations]
      // [START automl_vision_classification_list_model_evaluations]
      console.log(
        `Classification model evaluation metrics: ${evaluation.classificationEvaluationMetrics}`
      );
      // [END automl_language_text_classification_list_model_evaluations]
      // [END automl_vision_classification_list_model_evaluations]

      // [START automl_translate_list_model_evaluations]
      console.log(
        `Translation model evaluation metrics: ${evaluation.translationEvaluationMetrics}`
      );
      // [END automl_translate_list_model_evaluations]

      // [START automl_vision_object_detection_list_model_evaluations]
      console.log(
        `Object detection model evaluation metrics: ${evaluation.imageObjectDetectionEvaluationMetrics}`
      );
      // [START automl_language_entity_extraction_list_model_evaluations]
      // [START automl_language_sentiment_analysis_list_model_evaluations]
      // [START automl_language_text_classification_list_model_evaluations]
      // [START automl_translate_list_model_evaluations]
      // [START automl_vision_classification_list_model_evaluations]
    }
  }

  listModelEvaluations();
  // [END automl_language_entity_extraction_list_model_evaluations]
  // [END automl_language_sentiment_analysis_list_model_evaluations]
  // [END automl_language_text_classification_list_model_evaluations]
  // [END automl_translate_list_model_evaluations]
  // [END automl_vision_classification_list_model_evaluations]
  // [END automl_vision_object_detection_list_model_evaluations]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
