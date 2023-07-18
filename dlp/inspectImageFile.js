// Copyright 2023 Google LLC
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

// sample-metadata:
//  title: Inspects a image file.
//  description: Inspect a image for sensitive data like Phone Number, Email.
//  usage: node inspectImageFile.js.js my-project imagePath infoTypes
function main(projectId, imagePath) {
  // [START dlp_inspect_image_file]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');
  const mime = require('mime');
  const fs = require('fs');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const imagePath = './test.jpeg';

  // InfoTypes
  const infoTypes = [
    {name: 'PHONE_NUMBER'},
    {name: 'EMAIL_ADDRESS'},
    {name: 'CREDIT_CARD_NUMBER'},
  ];

  async function inspectImageFile() {
    let fileBytes = null;
    let fileTypeConstant = null;
    try {
      // Load Image
      fileTypeConstant =
        ['image/jpeg', 'image/bmp', 'image/png', 'image/svg'].indexOf(
          mime.getType(imagePath)
        ) + 1;
      fileBytes = Buffer.from(fs.readFileSync(imagePath)).toString('base64');
    } catch (error) {
      console.log(error);
      return;
    }

    // Specify item to inspect
    const item = {
      byteItem: {
        type: fileTypeConstant,
        data: fileBytes,
      },
    };

    // Specify inspect configuration to match information with mentioned infotypes.
    const inspectConfig = {
      infoTypes: infoTypes,
      includeQuote: true,
    };

    // Combine configurations into a request for the service.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      inspectConfig: inspectConfig,
      item: item,
    };

    // Use the client to send the request.
    const [response] = await dlp.inspectContent(request);

    // Print Findings
    const findings = response.result.findings;
    if (findings.length > 0) {
      console.log(`Findings: ${findings.length}\n`);
      findings.forEach(finding => {
        console.log(`InfoType: ${finding.infoType.name}`);
        console.log(`\tQuote: ${finding.quote}`);
        console.log(`\tLikelihood: ${finding.likelihood} \n`);
      });
    } else {
      console.log('No findings.');
    }
  }
  inspectImageFile();
  // [END dlp_inspect_image_file]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
