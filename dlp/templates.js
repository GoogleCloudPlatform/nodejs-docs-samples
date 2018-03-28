/**
 * Copyright 2017, Google, Inc.
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

function createInspectTemplate(
  callingProjectId,
  templateId,
  displayName,
  infoTypes,
  includeQuote,
  minLikelihood,
  maxFindings
) {
  // [START dlp_create_inspect_template]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // The minimum likelihood required before returning a match
  // const minLikelihood = 'LIKELIHOOD_UNSPECIFIED';

  // The maximum number of findings to report per request (0 = server maximum)
  // const maxFindings = 0;

  // The infoTypes of information to match
  // const infoTypes = [{ name: 'PHONE_NUMBER' }, { name: 'EMAIL_ADDRESS' }, { name: 'CREDIT_CARD_NUMBER' }];

  // Whether to include the matching string
  // const includeQuote = true;

  // (Optional) The name of the template to be created.
  // const templateId = 'my-template';

  // (Optional) The human-readable name to give the template
  // const displayName = 'My template';

  // Construct the inspection configuration for the template
  const inspectConfig = {
    infoTypes: infoTypes,
    minLikelihood: minLikelihood,
    includeQuote: includeQuote,
    limits: {
      maxFindingsPerRequest: maxFindings,
    },
  };

  // Construct template-creation request
  const request = {
    parent: dlp.projectPath(callingProjectId),
    inspectTemplate: {
      inspectConfig: inspectConfig,
      displayName: displayName,
    },
    templateId: templateId,
  };

  dlp
    .createInspectTemplate(request)
    .then(response => {
      const templateName = response[0].name;
      console.log(`Successfully created template ${templateName}.`);
    })
    .catch(err => {
      console.log(`Error in createInspectTemplate: ${err.message || err}`);
    });
  // [END dlp_create_inspect_template]
}

function listInspectTemplates(callingProjectId) {
  // [START dlp_list_inspect_templates]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The project ID to run the API call under
  // const callingProjectId = process.env.GCLOUD_PROJECT;

  // Helper function to pretty-print dates
  const formatDate = date => {
    const msSinceEpoch = parseInt(date.seconds, 10) * 1000;
    return new Date(msSinceEpoch).toLocaleString('en-US');
  };

  // Construct template-listing request
  const request = {
    parent: dlp.projectPath(callingProjectId),
  };

  // Run template-deletion request
  dlp
    .listInspectTemplates(request)
    .then(response => {
      const templates = response[0];
      templates.forEach(template => {
        console.log(`Template ${template.name}`);
        if (template.displayName) {
          console.log(`  Display name: ${template.displayName}`);
        }

        console.log(`  Created: ${formatDate(template.createTime)}`);
        console.log(`  Updated: ${formatDate(template.updateTime)}`);

        const inspectConfig = template.inspectConfig;
        const infoTypes = inspectConfig.infoTypes.map(x => x.name);
        console.log(`  InfoTypes:`, infoTypes.join(' '));
        console.log(`  Minimum likelihood:`, inspectConfig.minLikelihood);
        console.log(`  Include quotes:`, inspectConfig.includeQuote);

        const limits = inspectConfig.limits;
        console.log(
          `  Max findings per request:`,
          limits.maxFindingsPerRequest
        );
      });
    })
    .catch(err => {
      console.log(`Error in listInspectTemplates: ${err.message || err}`);
    });
  // [END dlp_list_inspect_templates]
}

function deleteInspectTemplate(templateName) {
  // [START dlp_delete_inspect_template]
  // Imports the Google Cloud Data Loss Prevention library
  const DLP = require('@google-cloud/dlp');

  // Instantiates a client
  const dlp = new DLP.DlpServiceClient();

  // The name of the template to delete
  // Parent project ID is automatically extracted from this parameter
  // const templateName = 'projects/YOUR_PROJECT_ID/inspectTemplates/#####'

  // Construct template-deletion request
  const request = {
    name: templateName,
  };

  // Run template-deletion request
  dlp
    .deleteInspectTemplate(request)
    .then(() => {
      console.log(`Successfully deleted template ${templateName}.`);
    })
    .catch(err => {
      console.log(`Error in deleteInspectTemplate: ${err.message || err}`);
    });
  // [END dlp_delete_inspect_template]
}

const cli = require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `create`,
    `Create a new DLP inspection configuration template.`,
    {
      minLikelihood: {
        alias: 'm',
        default: 'LIKELIHOOD_UNSPECIFIED',
        type: 'string',
        choices: [
          'LIKELIHOOD_UNSPECIFIED',
          'VERY_UNLIKELY',
          'UNLIKELY',
          'POSSIBLE',
          'LIKELY',
          'VERY_LIKELY',
        ],
        global: true,
      },
      infoTypes: {
        alias: 't',
        default: ['PHONE_NUMBER', 'EMAIL_ADDRESS', 'CREDIT_CARD_NUMBER'],
        type: 'array',
        global: true,
        coerce: infoTypes =>
          infoTypes.map(type => {
            return {name: type};
          }),
      },
      includeQuote: {
        alias: 'q',
        default: true,
        type: 'boolean',
        global: true,
      },
      maxFindings: {
        alias: 'f',
        default: 0,
        type: 'number',
        global: true,
      },
      templateId: {
        alias: 'i',
        default: '',
        type: 'string',
        global: true,
      },
      displayName: {
        alias: 'd',
        default: '',
        type: 'string',
        global: true,
      },
    },
    opts =>
      createInspectTemplate(
        opts.callingProjectId,
        opts.templateId,
        opts.displayName,
        opts.infoTypes,
        opts.includeQuote,
        opts.minLikelihood,
        opts.maxFindings
      )
  )
  .command(`list`, `List DLP inspection configuration templates.`, {}, opts =>
    listInspectTemplates(opts.callingProjectId)
  )
  .command(
    `delete <templateName>`,
    `Delete the DLP inspection configuration template with the specified name.`,
    {},
    opts => deleteInspectTemplate(opts.templateName)
  )
  .option('c', {
    type: 'string',
    alias: 'callingProjectId',
    default: process.env.GCLOUD_PROJECT || '',
    global: true,
  })
  .option('p', {
    type: 'string',
    alias: 'tableProjectId',
    default: process.env.GCLOUD_PROJECT || '',
    global: true,
  })
  .example(
    `node $0 create -m VERY_LIKELY -t PERSON_NAME -f 5 -q false -i my-template-id`
  )
  .example(`node $0 list`)
  .example(`node $0 delete projects/my-project/inspectTemplates/#####`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/dlp/docs.`);

if (module === require.main) {
  cli.help().strict().argv; // eslint-disable-line
}
