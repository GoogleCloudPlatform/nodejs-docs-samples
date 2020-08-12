// Copyright 2020 Google LLC
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
//  title: Delete Inspect Templates
//  description: Delete the DLP inspection configuration template with the specified name.
//  usage: node deleteInspectTemplates.js my-project projects/my-project/inspectTemplates/#####

function main(projectId, templateName) {
  // [START dlp_delete_inspect_template]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // The name of the template to delete
  // Parent project ID is automatically extracted from this parameter
  // const templateName = 'projects/YOUR_PROJECT_ID/inspectTemplates/#####'
  async function deleteInspectTemplate() {
    // Construct template-deletion request
    const request = {
      name: templateName,
    };

    // Run template-deletion request
    await dlp.deleteInspectTemplate(request);
    console.log(`Successfully deleted template ${templateName}.`);
  }

  deleteInspectTemplate();
  // [END dlp_delete_inspect_template]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
