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
  // [START documentai_process_specialized_document]
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

    // Read fields specificly from the specalized US drivers license processor:
    // https://cloud.google.com/document-ai/docs/processors-list#processor_us-driver-license-parser
    // retriving data from other specalized processors follow a similar pattern.
    // For a complete list of processors see:
    // https://cloud.google.com/document-ai/docs/processors-list
    //
    // OCR and other data is also present in the quality processor's response.
    // Please see the OCR and other samples for how to parse other data in the
    // response.
    const {document} = result;
    for (const entity of document.entities) {
      // Fields detected. For a full list of fields for each processor see
      // the processor documentation:
      // https://cloud.google.com/document-ai/docs/processors-list
      const key = entity.type;
      // some other value formats in addition to text are availible
      // e.g. dates: `entity.normalizedValue.dateValue.year`
      const textValue =
        entity.textAnchor !== null ? entity.textAnchor.content : '';
      const conf = entity.confidence * 100;
      console.log(
        `* ${JSON.stringify(key)}: ${JSON.stringify(textValue)}(${conf.toFixed(
          2
        )}% confident)`
      );
    }
  }

  // [END documentai_process_specialized_document]
  await processDocument();
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err);
  process.exitCode = 1;
});
