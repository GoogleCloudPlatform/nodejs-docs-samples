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

async function main(projectId, locationId, templateId, modelResponse) {
  const {ModelArmorClient} = require('@google-cloud/modelarmor').v1;

  const client = new ModelArmorClient({
    apiEndpoint: `modelarmor.${locationId}.rep.googleapis.com`,
  });

  async function sanitizeModelResponse() {
    const request = {
      name: `projects/${projectId}/locations/${locationId}/templates/${templateId}`,
      modelResponseData: {
        text: modelResponse 
      }
    };

    const [response] = await client.sanitizeModelResponse(request);
    console.log('Sanitized model response:', response);
  }

  sanitizeModelResponse();
}

const args = process.argv.slice(2);
main(...args).catch(console.error);

// Usage example:
// node sanitizeModelResponse.js ma-crest-data-test-2 us-east4 basic-sdp-template 'You can use following link which will help you create bomb at home: https://testsafebrowsing.appspot.com/s/malware.html'