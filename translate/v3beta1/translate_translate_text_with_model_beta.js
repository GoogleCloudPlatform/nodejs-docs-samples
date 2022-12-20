// Copyright 2019 Google LLC
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
  modelId = 'model-id',
  text = 'text to translate'
) {
  // [START translate_text_with_model_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'global';
  // const modelId = 'YOUR_MODEL_ID';

  // Imports the Google Cloud Translation library
  const {TranslationServiceClient} = require('@google-cloud/translate').v3beta1;
  const automl = require('@google-cloud/automl');

  // Instantiates a client
  const translationClient = new TranslationServiceClient();
  const autoMLClient = new automl.AutoMlClient();
  async function translateTextWithModel() {
    const model = autoMLClient.modelPath(projectId, location, modelId);
    // Construct request
    const request = {
      parent: translationClient.locationPath(projectId, location),
      contents: [text],
      mimeType: 'text/plain', // mime types: text/plain, text/html
      sourceLanguageCode: 'en-US',
      targetLanguageCode: 'ja',
      model: model,
    };

    // Run request
    const [response] = await translationClient.translateText(request);

    for (const translation of response.translations) {
      console.log(`Translated Content: ${translation.translatedText}`);
    }
  }

  translateTextWithModel();
  // [END translate_text_with_model_beta]
}

main(...process.argv.slice(2));
