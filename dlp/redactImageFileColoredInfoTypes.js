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

// sample-metadata:
//  title: Redact Image
//  description: Redact infoTypes from an image with color coding
//  usage: node redactImageFileColoredInfoTypes.js my-project filepath outputPath
function main(projectId, filepath, outputPath) {
  // [START dlp_redact_image_colored_infotypes]
  // Imports the Google Cloud Data Loss Prevention library
  import {DLP} from '@google-cloud/dlp';

  // Imports required Node.js libraries
  const mime = require('mime');
  const fs = require('fs');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The path to a local file to inspect. Can be a JPG or PNG image file.
  // const filepath = 'path/to/image.png';

  // The local path to save the resulting image to.
  // const outputPath = 'result.png';

  async function redactImageColoredInfoType() {
    // Define types of info to redact associate each one with a different color.
    const imageRedactionConfigs = [
      {
        infoType: {name: 'US_SOCIAL_SECURITY_NUMBER'},
        redactionColor: {red: 0.3, green: 0.1, blue: 0.6},
      },
      {
        infoType: {name: 'EMAIL_ADDRESS'},
        redactionColor: {red: 0.5, green: 0.5, blue: 1},
      },
      {
        infoType: {name: 'PHONE_NUMBER'},
        redactionColor: {red: 1, green: 0, blue: 0.6},
      },
    ];

    // Load image
    const fileTypeConstant =
      ['image/jpeg', 'image/bmp', 'image/png', 'image/svg'].indexOf(
        mime.getType(filepath)
      ) + 1;
    const fileBytes = Buffer.from(fs.readFileSync(filepath)).toString('base64');

    // Construct the Redact request to be sent by the client.
    const request = {
      parent: `projects/${projectId}/locations/global`,
      byteItem: {
        type: fileTypeConstant,
        data: fileBytes,
      },
      imageRedactionConfigs: imageRedactionConfigs,
    };

    // Send the request and receive response from the service.
    const [response] = await dlp.redactImage(request);
    const image = response.redactedImage;
    fs.writeFileSync(outputPath, image);
    console.log(`Saved image redaction results to path: ${outputPath}`);
  }
  redactImageColoredInfoType();
  // [END dlp_redact_image_colored_infotypes]
}

process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});

main(...process.argv.slice(2));
