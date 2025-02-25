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

// sample-metadata:
//  title: List Inspect Templates
//  description: List DLP inspection configuration templates.
//  usage: node listInspectTemplates.js my-project

function main(projectId) {
  // [START dlp_list_inspect_templates]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const projectId = 'my-project';

  // Helper function to pretty-print dates
  const formatDate = date => {
    const msSinceEpoch = parseInt(date.seconds, 10) * 1000;
    return new Date(msSinceEpoch).toLocaleString('en-US');
  };

  async function listInspectTemplates() {
    // Construct template-listing request
    const request = {
      parent: `projects/${projectId}/locations/global`,
    };

    // Run template-deletion request
    const [templates] = await dlp.listInspectTemplates(request);

    templates.forEach(template => {
      console.log(`Template ${template.name}`);
      if (template.displayName) {
        console.log(`  Display name: ${template.displayName}`);
      }

      console.log(`  Created: ${formatDate(template.createTime)}`);
      console.log(`  Updated: ${formatDate(template.updateTime)}`);

      const inspectConfig = template.inspectConfig;
      const infoTypes = inspectConfig.infoTypes.map(x => x.name);
      console.log('  InfoTypes:', infoTypes.join(' '));
      console.log('  Minimum likelihood:', inspectConfig.minLikelihood);
      console.log('  Include quotes:', inspectConfig.includeQuote);

      const limits = inspectConfig.limits;
      console.log('  Max findings per request:', limits.maxFindingsPerRequest);
    });
  }

  listInspectTemplates();
  // [END dlp_list_inspect_templates]
}

main(...process.argv.slice(2));
process.on('unhandledRejection', err => {
  console.error(err.message);
  process.exitCode = 1;
});
