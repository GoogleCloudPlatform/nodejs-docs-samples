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
  modelId = 'YOUR_MODEL_ID',
  modelEvaluationId = 'YOUR_MODEL_EVALUATION_ID'
) {
  // [START automl_language_entity_extraction_get_model_evaluation]
  // [START automl_language_sentiment_analysis_get_model_evaluation]
  // [START automl_language_text_classification_get_model_evaluation]
  // [START automl_translate_get_model_evaluation]
  // [START automl_vision_classification_get_model_evaluation]
  // [START automl_vision_object_detection_get_model_evaluation]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'us-central1';
  // const modelId = 'YOUR_MODEL_ID';
  // const modelEvaluationId = 'YOUR_MODEL_EVALUATION_ID';

  // Imports the Google Cloud AutoML library
  const {AutoMlClient} = require('@google-cloud/automl').v1;

  // Instantiates a client
  const client = new AutoMlClient();

  async function getModelEvaluation() {
    // Construct request
    const request = {
      name: client.modelEvaluationPath(
        projectId,
        location,
        modelId,
        modelEvaluationId
      ),
    };

    const [response] = await client.getModelEvaluation(request);

    console.log(`Model evaluation name: ${response.name}`);
    console.log(`Model annotation spec id: ${response.annotationSpecId}`);
    console.log(`Model display name: ${response.displayName}`);
    console.log('Model create time');
    console.log(`\tseconds ${response.createTime.seconds}`);
    console.log(`\tnanos ${response.createTime.nanos / 1e9}`);
    console.log(`Evaluation example count: ${response.evaluatedExampleCount}`);
    // [END automl_language_sentiment_analysis_get_model_evaluation]
    // [END automl_language_text_classification_get_model_evaluation]
    // [END automl_translate_get_model_evaluation]
    // [END automl_vision_classification_get_model_evaluation]
    // [END automl_vision_object_detection_get_model_evaluation]
    console.log(
      `Entity extraction model evaluation metrics: ${response.textExtractionEvaluationMetrics}`
    );
    // [END automl_language_entity_extraction_get_model_evaluation]

    // [START automl_language_sentiment_analysis_get_model_evaluation]
    console.log(
      `Sentiment analysis model evaluation metrics: ${response.textSentimentEvaluationMetrics}`
    );
    // [END automl_language_sentiment_analysis_get_model_evaluation]

    // [START automl_language_text_classification_get_model_evaluation]
    // [START automl_vision_classification_get_model_evaluation]
    console.log(
      `Classification model evaluation metrics: ${response.classificationEvaluationMetrics}`
    );
    // [END automl_language_text_classification_get_model_evaluation]
    // [END automl_vision_classification_get_model_evaluation]

    // [START automl_translate_get_model_evaluation]
    console.log(
      `Translation model evaluation metrics: ${response.translationEvaluationMetrics}`
    );
    // [END automl_translate_get_model_evaluation]

    // [START automl_vision_object_detection_get_model_evaluation]
    console.log(
      `Object detection model evaluation metrics: ${response.imageObjectDetectionEvaluationMetrics}`
    );
    // [START automl_language_entity_extraction_get_model_evaluation]
    // [START automl_language_sentiment_analysis_get_model_evaluation]
    // [START automl_language_text_classification_get_model_evaluation]
    // [START automl_translate_get_model_evaluation]
    // [START automl_vision_classification_get_model_evaluation]
  }

  getModelEvaluation();
  // [END automl_language_entity_extraction_get_model_evaluation]
  // [END automl_language_sentiment_analysis_get_model_evaluation]
  // [END automl_language_text_classification_get_model_evaluation]
  // [END automl_translate_get_model_evaluation]
  // [END automl_vision_classification_get_model_evaluation]
  // [END automl_vision_object_detection_get_model_evaluation]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
main(...process.argv.slice(2));
