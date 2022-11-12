/**
 * Copyright 2020, Google, Inc.
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

'use strict';

async function main(
  projectId,
  location,
  autoMLModel,
  gcsInputUri = 'gs://cloud-samples-data/documentai/invoice.pdf'
) {
  // [START documentai_parse_with_model]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
  // const autoMLModel = 'Full resource name of AutoML Natural Language model';
  // const gcsInputUri = 'YOUR_SOURCE_PDF';

  const {DocumentUnderstandingServiceClient} =
    require('@google-cloud/documentai').v1beta2;
  const client = new DocumentUnderstandingServiceClient();

  async function parseWithModel() {
    // Configure the request for processing the PDF
    const parent = `projects/${projectId}/locations/${location}`;
    const request = {
      parent,
      inputConfig: {
        gcsSource: {
          uri: gcsInputUri,
        },
        mimeType: 'application/pdf',
      },
      automlParams: {
        model: autoMLModel,
      },
    };

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);

    for (const label of result.labels) {
      console.log(`Label detected: ${label.name}`);
      console.log(`Confidence: ${label.confidence}`);
    }
  }
  // [END documentai_parse_with_model]
  await parseWithModel();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
