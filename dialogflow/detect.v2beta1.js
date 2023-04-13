// Copyright 2018 Google LLC
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

const sessionId = require('uuid').v1();
const util = require('util');

async function createKnowledgeBase(projectId, displayName) {
  // [START dialogflow_create_knowledge_base]
  // Imports the Dialogflow client library
  const dialogflow = require('@google-cloud/dialogflow').v2beta1;

  // Instantiate a DialogFlow client.
  const client = new dialogflow.KnowledgeBasesClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'ID of GCP project associated with your Dialogflow agent';
  // const displayName = `your knowledge base display name, e.g. myKnowledgeBase`;

  const formattedParent = 'projects/' + projectId;
  const knowledgeBase = {
    displayName: displayName,
  };
  const request = {
    parent: formattedParent,
    knowledgeBase: knowledgeBase,
  };

  const [result] = await client.createKnowledgeBase(request);
  console.log(`Name: ${result.name}`);
  console.log(`displayName: ${result.displayName}`);

  // [END dialogflow_create_knowledge_base]
}

/*
 *This test is commented until the proto change for dialogflow/v2beta1 is finished.
 */
// async function createDocument(
//   projectId,
//   knowledgeBaseFullName,
//   documentPath,
//   documentName,
//   knowledgeTypes,
//   mimeType
// ) {
//   // [START dialogflow_create_document]
//   // Imports the Dialogflow client library
//   const dialogflow = require('@google-cloud/dialogflow').v2beta1;

//   // Instantiate a DialogFlow Documents client.
//   const client = new dialogflow.DocumentsClient({
//     projectId: projectId,
//   });

//   /**
//    * TODO(developer): Uncomment the following lines before running the sample.
//    */
//   // const projectId = 'ID of GCP project associated with your Dialogflow agent';
//   // const knowledgeBaseFullName = `the full path of your knowledge base, e.g my-Gcloud-project/myKnowledgeBase`;
//   // const documentPath = `path of the document you'd like to add, e.g. https://dialogflow.com/docs/knowledge-connectors`;
//   // const documentName = `displayed name of your document in knowledge base, e.g. myDoc`;
//   // const knowledgeTypes = `The Knowledge type of the Document. e.g. FAQ`;
//   // const mimeType = `The mime_type of the Document. e.g. text/csv, text/html,text/plain, text/pdf etc.`;

//   const request = {
//     parent: knowledgeBaseFullName,
//     document: {
//       knowledgeTypes: [knowledgeTypes],
//       displayName: documentName,
//       contentUri: documentPath,
//       source: 'contentUri',
//       mimeType: mimeType,
//     },
//   };

//   const [operation] = await client.createDocument(request);
//   const [response] = await operation.promise();

//   console.log('Document created');
//   console.log(`Content URI...${response.contentUri}`);
//   console.log(`displayName...${response.displayName}`);
//   console.log(`mimeType...${response.mimeType}`);
//   console.log(`name...${response.name}`);
//   console.log(`source...${response.source}`);

//   // [END dialogflow_create_document]
// }

async function detectIntentandSentiment(
  projectId,
  sessionId,
  query,
  languageCode
) {
  // [START dialogflow_detect_intent_with_sentiment_analysis]
  // Imports the Dialogflow client library
  const dialogflow = require('@google-cloud/dialogflow').v2beta1;
  // Instantiate a DialogFlow client.
  const sessionClient = new dialogflow.SessionsClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'ID of GCP project associated with your Dialogflow agent';
  // const sessionId = `user specific ID of session, e.g. 12345`;
  // const query = `phrase(s) to pass to detect, e.g. I'd like to reserve a room for six people`;
  // const languageCode = 'BCP-47 language code, e.g. en-US';

  // Define session path
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
    queryParams: {
      sentimentAnalysisRequestConfig: {
        analyzeQueryTextSentiment: true,
      },
    },
  };

  // Send request and log result
  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = responses[0].queryResult;
  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  if (result.sentimentAnalysisResult) {
    console.log('Detected sentiment');
    console.log(
      `  Score: ${result.sentimentAnalysisResult.queryTextSentiment.score}`
    );
    console.log(
      `  Magnitude: ${result.sentimentAnalysisResult.queryTextSentiment.magnitude}`
    );
  } else {
    console.log('No sentiment Analysis Found');
  }
  // [END dialogflow_detect_intent_with_sentiment_analysis]
}

async function detectIntentwithTexttoSpeechResponse(
  projectId,
  sessionId,
  query,
  languageCode,
  outputFile
) {
  // [START dialogflow_detect_intent_with_texttospeech_response]
  // Imports the Dialogflow client library
  const dialogflow = require('@google-cloud/dialogflow').v2beta1;
  // Instantiate a DialogFlow client.
  const sessionClient = new dialogflow.SessionsClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'ID of GCP project associated with your Dialogflow agent';
  // const sessionId = `user specific ID of session, e.g. 12345`;
  // const query = `phrase(s) to pass to detect, e.g. I'd like to reserve a room for six people`;
  // const languageCode = 'BCP-47 language code, e.g. en-US';
  // const outputFile = `path for audio output file, e.g. ./resources/myOutput.wav`;

  // Define session path
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const fs = require('fs');

  // The audio query request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
    outputAudioConfig: {
      audioEncoding: 'OUTPUT_AUDIO_ENCODING_LINEAR_16',
    },
  };

  const responses = await sessionClient.detectIntent(request);
  console.log('Detected intent:');
  const audioFile = responses[0].outputAudio;
  await util.promisify(fs.writeFile)(outputFile, audioFile, 'binary');
  console.log(`Audio content written to file: ${outputFile}`);
  // [END dialogflow_detect_intent_with_texttospeech_response]
}

async function detectIntentKnowledge(
  projectId,
  sessionId,
  languageCode,
  knowledgeBaseId,
  query
) {
  // [START dialogflow_detect_intent_knowledge]
  // Imports the Dialogflow client library
  const dialogflow = require('@google-cloud/dialogflow').v2beta1;
  // Instantiate a DialogFlow client.
  const sessionClient = new dialogflow.SessionsClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const projectId = 'ID of GCP project associated with your Dialogflow agent';
  // const sessionId = `user specific ID of session, e.g. 12345`;
  // const languageCode = 'BCP-47 language code, e.g. en-US';
  // const knowledgeBaseId = `the ID of your KnowledgeBase`;
  // const query = `phrase(s) to pass to detect, e.g. I'd like to reserve a room for six people`;

  // Define session path
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );
  const knowledgeBasePath =
    'projects/' + projectId + '/knowledgeBases/' + knowledgeBaseId + '';

  // The audio query request
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: languageCode,
      },
    },
    queryParams: {
      knowledgeBaseNames: [knowledgeBasePath],
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  console.log(`Query text: ${result.queryText}`);
  console.log(`Detected Intent: ${result.intent.displayName}`);
  console.log(`Confidence: ${result.intentDetectionConfidence}`);
  console.log(`Query Result: ${result.fulfillmentText}`);
  if (result.knowledgeAnswers && result.knowledgeAnswers.answers) {
    const answers = result.knowledgeAnswers.answers;
    console.log(`There are ${answers.length} answer(s);`);
    answers.forEach(a => {
      console.log(`   answer: ${a.answer}`);
      console.log(`   confidence: ${a.matchConfidence}`);
      console.log(`   match confidence level: ${a.matchConfidenceLevel}`);
    });
  }
  // [END dialogflow_detect_intent_knowledge]
}

const cli = require('yargs')
  .demand(1)
  .options({
    documentId: {
      alias: 'd',
      type: 'string',
      requiresArg: true,
      description: 'Full path of document in knowledge base',
    },
    documentName: {
      alias: 'm',
      type: 'string',
      default: 'testDoc',
      requiresArg: true,
      description: 'Name of Document to Create',
    },
    documentPath: {
      alias: 'z',
      type: 'string',
      requiresArg: true,
      description: 'uri of document to be added',
    },
    knowledgeBaseName: {
      alias: 'k',
      default: 'TestKnowledgeBase',
      type: 'string',
      requiresArg: true,
      description: 'The name of the knowledge base to search from',
    },
    knowledgeBaseFullName: {
      alias: 'n',
      type: 'string',
      requiresArg: true,
      description: 'full path knowledge base',
    },
    knowledgeTypes: {
      alias: 't',
      type: 'string',
      default: 'FAQ',
      requiresArg: true,
      description: 'The Knowledge type of the Document.',
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      type: 'string',
      requiresArg: true,
      description: 'The language code of the query. Defaults to "en-US".',
    },
    mimeType: {
      alias: 'y',
      default: 'text/html',
      type: 'string',
      requiresArg: true,
      description: 'The mime_type of the Document',
    },
    outputFile: {
      alias: 'f',
      default: './resources/output.wav',
      global: true,
      requiresArg: true,
      type: 'string',
    },
    projectId: {
      alias: 'p',
      default: process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT,
      description:
        'The Project ID to use. Defaults to the value of the ' +
        'GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT environment variables.',
      requiresArg: true,
      type: 'string',
    },
    query: {
      alias: 'q',
      array: true,
      string: true,
      demandOption: true,
      requiresArg: true,
      description: 'An array of text queries',
      default: 'Where is my data stored?',
    },
    sessionId: {
      alias: 's',
      default: sessionId,
      type: 'string',
      requiresArg: true,
      description:
        'The identifier of the detect session. Defaults to a random UUID.',
    },
  })
  .command('createKnowledgeBase', 'Creates a new knowledge base', {}, opts =>
    createKnowledgeBase(opts.projectId, opts.knowledgeBaseName)
  )
  /**
   * TODO(developer): Uncomment the following lines until proto updates for dialogflow/v2beta1 is complete.
   * This method should be annotated with (google.longrunning.operationInfo) to generate LRO methods.
   * Now it's a simple method, without proper LRO response, so it fails because `promise() is not a function`.
   */
  // .command(
  //   'createDocument',
  //   'Creates a new document for this knowledge base',
  //   {},
  //   opts =>
  //     createDocument(
  //       opts.projectId,
  //       opts.knowledgeBaseFullName,
  //       opts.documentPath,
  //       opts.documentName,
  //       opts.knowledgeTypes,
  //       opts.mimeType
  //     )
  // )
  .command(
    'detectIntentwithTexttoSpeechResponse',
    'Detects the intent of text input, outputs .wav file to target location',
    {},
    opts =>
      detectIntentwithTexttoSpeechResponse(
        opts.projectId,
        opts.sessionId,
        opts.query,
        opts.languageCode,
        opts.outputFile
      )
  )
  .command(
    'detectIntentKnowledge',
    'Detects answers from knowledge base queries',
    {},
    opts =>
      detectIntentKnowledge(
        opts.projectId,
        opts.sessionId,
        opts.languageCode,
        opts.knowledgeBaseFullName,
        opts.query
      )
  )
  .command(
    'detectIntentandSentiment',
    'Detects sentiment with detect Intent query',
    {},
    opts =>
      detectIntentandSentiment(
        opts.projectId,
        opts.sessionId,
        opts.query,
        opts.languageCode
      )
  )
  .example('node $0 createKnowledgeBase -k "newTestKnowledgeBase"')
  .example(
    'node $0 createDocument -n "KNOWLEDGEBASEFULLNAME" -p "URIHTMLPATHTODOC" -m "MyDoc"'
  )
  .example('node $0 detectIntentwithTexttoSpeechResponse "How do I sign up?"')
  .example('node $0 detectIntentKnowledge -q "how do i sign up?"')
  .example(
    'node $0 detectIntentandSentiment "Book a great room for six great folks!"'
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
