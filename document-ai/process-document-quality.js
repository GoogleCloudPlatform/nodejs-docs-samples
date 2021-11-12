/**
 * Copyright 2021, Google, Inc.
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

async function main(projectId, location, processorId, filePath) {
  // [START documentai_process_quality_document]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const projectId = 'YOUR_PROJECT_ID';
  // const location = 'YOUR_PROJECT_LOCATION'; // Format is 'us' or 'eu'
  // const processorId = 'YOUR_PROCESSOR_ID'; // Create processor in Cloud Console
  // const filePath = '/path/to/local/pdf';

  const {DocumentProcessorServiceClient} =
    require('@google-cloud/documentai').v1beta3;

  // Instantiates a client
  const client = new DocumentProcessorServiceClient();

  async function processDocument() {
    // The full resource name of the processor, e.g.:
    // projects/project-id/locations/location/processor/processor-id
    // You must create new processors in the Cloud Console first
    const name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // Read the file into memory.
    const fs = require('fs').promises;
    const imageFile = await fs.readFile(filePath);

    // Convert the image data to a Buffer and base64 encode it.
    const encodedImage = Buffer.from(imageFile).toString('base64');

    const request = {
      name,
      rawDocument: {
        content: encodedImage,
        mimeType: 'application/pdf',
      },
    };

    // Recognizes text entities in the PDF document
    const [result] = await client.processDocument(request);

    console.log('Document processing complete.');

    // Read the quality-specific information from the output from the
    // Intelligent Document Quality Processor:
    // https://cloud.google.com/document-ai/docs/processors-list#processor_doc-quality-processor
    // OCR and other data is also present in the quality processor's response.
    // Please see the OCR and other samples for how to parse other data in the
    // response.
    const {document} = result;
    for (const entity of document.entities) {
      const entityConf = entity.confidence * 100;
      const pageNum = parseInt(entity.pageAnchor.pageRefs.page) + 1 || 1;
      console.log(
        `Page ${pageNum} has a quality score of ${entityConf.toFixed(2)}%:`
      );
      for (const prop of entity.properties) {
        const propConf = prop.confidence * 100;
        console.log(`\t* ${prop.type} score of ${propConf.toFixed(2)}%`);
      }
    }
  }

  // [END documentai_process_quality_document]
  await processDocument();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
