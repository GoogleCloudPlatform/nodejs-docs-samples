// Copyright 2017 Google LLC
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

// /////////////////////////////////////////////////////////////////////////////
// Operations for intents
// /////////////////////////////////////////////////////////////////////////////

async function deleteIntent(projectId, intentId) {
  // [START dialogflow_delete_intent]
  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates clients
  const intentsClient = new dialogflow.IntentsClient();

  const intentPath = intentsClient.projectAgentIntentPath(projectId, intentId);

  const request = {name: intentPath};

  // Send the request for deleting the intent.
  const result = await intentsClient.deleteIntent(request);
  console.log(`Intent ${intentPath} deleted`);
  return result;
  // [END dialogflow_delete_intent]
}

// /////////////////////////////////////////////////////////////////////////////
// Operations for session entity type
// /////////////////////////////////////////////////////////////////////////////

async function createSessionEntityType(
  projectId,
  sessionId,
  entityValues,
  entityTypeDisplayName,
  entityOverrideMode
) {
  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  const sessionPath = sessionEntityTypesClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const sessionEntityTypePath =
    sessionEntityTypesClient.projectAgentSessionEntityTypePath(
      projectId,
      sessionId,
      entityTypeDisplayName
    );

  // Here we use the entity value as the only synonym.
  const entities = [];
  entityValues.forEach(entityValue => {
    entities.push({
      value: entityValue,
      synonyms: [entityValue],
    });
  });

  const sessionEntityTypeRequest = {
    parent: sessionPath,
    sessionEntityType: {
      name: sessionEntityTypePath,
      entityOverrideMode: entityOverrideMode,
      entities: entities,
    },
  };

  const [response] = await sessionEntityTypesClient.createSessionEntityType(
    sessionEntityTypeRequest
  );
  console.log('SessionEntityType created:');
  console.log(response);
}

async function listSessionEntityTypes(projectId, sessionId) {
  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();
  const sessionPath = sessionEntityTypesClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    parent: sessionPath,
  };

  // Send the request for retrieving the sessionEntityType.
  const [response] =
    await sessionEntityTypesClient.listSessionEntityTypes(request);
  response.forEach(sessionEntityType => {
    console.log(`Session entity type name: ${sessionEntityType.name}`);
    console.log(`Number of entities: ${sessionEntityType.entities.length}\n`);
  });
}

async function deleteSessionEntityType(
  projectId,
  sessionId,
  entityTypeDisplayName
) {
  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates clients
  const sessionEntityTypesClient = new dialogflow.SessionEntityTypesClient();

  // The path to identify the sessionEntityType to be deleted.
  const sessionEntityTypePath =
    sessionEntityTypesClient.projectAgentSessionEntityTypePath(
      projectId,
      sessionId,
      entityTypeDisplayName
    );

  const request = {
    name: sessionEntityTypePath,
  };

  // Send the request for retrieving the sessionEntityType.
  const result =
    await sessionEntityTypesClient.deleteSessionEntityType(request);
  console.log(`Session entity type ${entityTypeDisplayName} deleted`);
  return result;
}

// /////////////////////////////////////////////////////////////////////////////
// Command line interface.
// /////////////////////////////////////////////////////////////////////////////
const cli = require('yargs')
  .demand(1)
  .options({
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the ' +
        'GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
  })
  .demandOption(
    'projectId',
    "Please provide your Dialogflow agent's project ID with the -p flag or through the GOOGLE_CLOUD_PROJECT env var"
  )
  .boolean('force')
  .alias('force', ['f'])
  .describe('force', 'force operation without a prompt')
  .command(
    'delete-intent',
    'Delete Intent',
    {
      intentId: {
        alias: 'i',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Intent Id',
      },
    },
    opts => deleteIntent(opts.projectId, opts.intentId)
  )
  .command(
    'create-session-entity-type',
    'Create entity type',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      entityValues: {
        alias: 'e',
        array: true,
        demandOption: true,
        requiresArg: true,
        description: 'The kind of entity. KIND_MAP or KIND_LIST.',
      },
      entityTypeDisplayName: {
        alias: 'd',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      entityOverrideMode: {
        alias: 'o',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
    },
    opts =>
      createSessionEntityType(
        opts.projectId,
        opts.sessionId,
        opts.entityValues,
        opts.entityTypeDisplayName,
        opts.entityOverrideMode
      )
  )
  .command(
    'list-session-entity-types',
    'List entity types',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
    },
    opts => listSessionEntityTypes(opts.projectId, opts.sessionId)
  )
  .command(
    'delete-session-entity-type',
    'Delete entity type',
    {
      sessionId: {
        alias: 's',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
      entityTypeDisplayName: {
        alias: 'd',
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'Display Name',
      },
    },
    opts =>
      deleteSessionEntityType(
        opts.projectId,
        opts.sessionId,
        opts.entityTypeDisplayName
      )
  )
  .wrap(120)
  .recommendCommands()
  .epilogue(
    'For more information, see https://cloud.google.com/dialogflow-enterprise/docs'
  )
  .help()
  .strict();

if (module === require.main) {
  cli.parse(process.argv.slice(2));
}
