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
//  description: Inspect a image without info type, this will search for most common infotype by default.
//  usage: node inspectImageFileAllInfoTypes.js.js.js my-project imagePath
function main(projectId, imagePath) {
  // [START dlp_inspect_image_all_infotypes]
  // Imports the Google Cloud Data Loss Prevention library
  import DLP from '@google-cloud/dlp';
  import {mine} from 'mime';
  import {fs} from 'fs';

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // Image Path
  // const imagePath = './test.jpeg';

  async function inspectImageFileAllType() {
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
      console.error(error.message);
      return;
    }
    // Specify the content to be inspected.
    const item = {
      byteItem: {
        type: fileTypeConstant,
        data: fileBytes,
      },
    };

    // Construct the Inspect request to be sent by the client.
    // Do not specify the type of info to inspect.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      item: item,
      inspectConfig: {
        includeQuote: true,
      },
    };

    // Use the client to send the API request.
    const [response] = await dlp.inspectContent(request);

    // Print findings.
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
  inspectImageFileAllType();
  // [END dlp_inspect_image_all_infotypes]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
