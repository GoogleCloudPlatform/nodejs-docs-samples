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

function detectTextIntent(projectId, sessionId, queries, languageCode) {
  // [START dialogflow_detect_intent_text]

  /**
   * TODO(developer): UPDATE these variables before running the sample.
   */
  // projectId: ID of the GCP project where Dialogflow agent is deployed
  // const projectId = 'PROJECT_ID';
  // sessionId: String representing a random number or hashed user identifier
  // const sessionId = '123456';
  // queries: A set of sequential queries to be send to Dialogflow agent for Intent Detection
  // const queries = [
  //   'Reserve a meeting room in Toronto office, there will be 5 of us',
  //   'Next monday at 3pm for 1 hour, please', // Tell the bot when the meeting is taking place
  //   'B'  // Rooms are defined on the Dialogflow agent, default options are A, B, or C
  // ]
  // languageCode: Indicates the language Dialogflow agent should use to detect intents
  // const languageCode = 'en';

  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  async function detectIntent(
    projectId,
    sessionId,
    query,
    contexts,
    languageCode
  ) {
    // The path to identify the agent that owns the created intent.
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
    };

    if (contexts && contexts.length > 0) {
      request.queryParams = {
        contexts: contexts,
      };
    }

    const responses = await sessionClient.detectIntent(request);
    return responses[0];
  }

  async function executeQueries(projectId, sessionId, queries, languageCode) {
    // Keeping the context across queries let's us simulate an ongoing conversation with the bot
    let context;
    let intentResponse;
    for (const query of queries) {
      try {
        console.log(`Sending Query: ${query}`);
        intentResponse = await detectIntent(
          projectId,
          sessionId,
          query,
          context,
          languageCode
        );
        console.log('Detected intent');
        console.log(
          `Fulfillment Text: ${intentResponse.queryResult.fulfillmentText}`
        );
        // Use the context from this response for next queries
        context = intentResponse.queryResult.outputContexts;
      } catch (error) {
        console.log(error);
      }
    }
  }
  executeQueries(projectId, sessionId, queries, languageCode);
  // [END dialogflow_detect_intent_text]
}

async function detectEventIntent(
  projectId,
  sessionId,
  eventName,
  languageCode
) {
  const {struct} = require('pb-util');

  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      event: {
        name: eventName,
        parameters: struct.encode({foo: 'bar'}),
        languageCode: languageCode,
      },
    },
  };

  const [response] = await sessionClient.detectIntent(request);
  console.log('Detected intent');
  const result = response.queryResult;
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log('  Output contexts:');
    result.outputContexts.forEach(context => {
      const contextId =
        contextClient.matchContextFromProjectAgentSessionContextName(
          context.name
        );
      const contextParameters = JSON.stringify(
        struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
}

async function detectAudioIntent(
  projectId,
  sessionId,
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START dialogflow_detect_intent_audio]
  const fs = require('fs');
  const util = require('util');
  const {struct} = require('pb-util');
  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  // Read the content of the audio file and send it as part of the request.
  const readFile = util.promisify(fs.readFile);
  const inputAudio = await readFile(filename);
  const request = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
    },
    inputAudio: inputAudio,
  };

  // Recognizes the speech in the audio and detects its intent.
  const [response] = await sessionClient.detectIntent(request);

  console.log('Detected intent:');
  const result = response.queryResult;
  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log('  No intent matched.');
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log('  Output contexts:');
    result.outputContexts.forEach(context => {
      const contextId =
        contextClient.matchContextFromProjectAgentSessionContextName(
          context.name
        );
      const contextParameters = JSON.stringify(
        struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
  // [END dialogflow_detect_intent_audio]
}

async function streamingDetectIntent(
  projectId,
  sessionId,
  filename,
  encoding,
  sampleRateHertz,
  languageCode
) {
  // [START dialogflow_detect_intent_streaming]
  const fs = require('fs');
  const util = require('util');
  const {Transform, pipeline} = require('stream');
  const {struct} = require('pb-util');

  const pump = util.promisify(pipeline);
  // Imports the Dialogflow library
  const dialogflow = require('@google-cloud/dialogflow');

  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();

  // The path to the local file on which to perform speech recognition, e.g.
  // /path/to/audio.raw const filename = '/path/to/audio.raw';

  // The encoding of the audio file, e.g. 'AUDIO_ENCODING_LINEAR_16'
  // const encoding = 'AUDIO_ENCODING_LINEAR_16';

  // The sample rate of the audio file in hertz, e.g. 16000
  // const sampleRateHertz = 16000;

  // The BCP-47 language code to use, e.g. 'en-US'
  // const languageCode = 'en-US';
  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const initialStreamRequest = {
    session: sessionPath,
    queryInput: {
      audioConfig: {
        audioEncoding: encoding,
        sampleRateHertz: sampleRateHertz,
        languageCode: languageCode,
      },
    },
  };

  // Create a stream for the streaming request.
  const detectStream = sessionClient
    .streamingDetectIntent()
    .on('error', console.error)
    .on('data', data => {
      if (data.recognitionResult) {
        console.log(
          `Intermediate transcript: ${data.recognitionResult.transcript}`
        );
      } else {
        console.log('Detected intent:');

        const result = data.queryResult;
        // Instantiates a context client
        const contextClient = new dialogflow.ContextsClient();

        console.log(`  Query: ${result.queryText}`);
        console.log(`  Response: ${result.fulfillmentText}`);
        if (result.intent) {
          console.log(`  Intent: ${result.intent.displayName}`);
        } else {
          console.log('  No intent matched.');
        }
        const parameters = JSON.stringify(struct.decode(result.parameters));
        console.log(`  Parameters: ${parameters}`);
        if (result.outputContexts && result.outputContexts.length) {
          console.log('  Output contexts:');
          result.outputContexts.forEach(context => {
            const contextId =
              contextClient.matchContextFromProjectAgentSessionContextName(
                context.name
              );
            const contextParameters = JSON.stringify(
              struct.decode(context.parameters)
            );
            console.log(`    ${contextId}`);
            console.log(`      lifespan: ${context.lifespanCount}`);
            console.log(`      parameters: ${contextParameters}`);
          });
        }
      }
    });

  // Write the initial stream request to config for audio input.
  detectStream.write(initialStreamRequest);

  // Stream an audio file from disk to the Conversation API, e.g.
  // "./resources/audio.raw"
  await pump(
    fs.createReadStream(filename),
    // Format the audio stream into the request format.
    new Transform({
      objectMode: true,
      transform: (obj, _, next) => {
        next(null, {inputAudio: obj});
      },
    }),
    detectStream
  );
  // [END dialogflow_detect_intent_streaming]
}

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
    sessionId: {
      alias: 's',
      default: require('uuid').v1(),
      type: 'string',
      requiresArg: true,
      description:
        'The identifier of the detect session. Defaults to a random UUID.',
    },
    languageCode: {
      alias: 'l',
      default: 'en-US',
      type: 'string',
      requiresArg: true,
      description: 'The language code of the query. Defaults to "en-US".',
    },
    encoding: {
      alias: 'e',
      default: 'AUDIO_ENCODING_LINEAR_16',
      choices: [
        'AUDIO_ENCODING_LINEAR_16',
        'AUDIO_ENCODING_FLAC',
        'AUDIO_ENCODING_MULAW',
        'AUDIO_ENCODING_AMR',
        'AUDIO_ENCODING_AMR_WB',
        'AUDIO_ENCODING_OGG_OPUS',
        'AUDIO_ENCODING_SPEEX_WITH_HEADER_BYTE',
      ],
      requiresArg: true,
      description: 'The encoding of the input audio.',
    },
    sampleRateHertz: {
      alias: 'r',
      type: 'number',
      description:
        'The sample rate in Hz of the input audio. Only ' +
        'required if the input audio is in raw format.',
    },
  })
  .demandOption(
    'projectId',
    "Please provide your Dialogflow agent's project ID with the -p flag or through the GOOGLE_CLOUD_PROJECT env var"
  )
  .command(
    'text',
    'Detects the intent for text queries.',
    {
      queries: {
        alias: 'q',
        array: true,
        string: true,
        demandOption: true,
        requiresArg: true,
        description: 'An array of text queries',
      },
    },
    opts =>
      detectTextIntent(
        opts.projectId,
        opts.sessionId,
        opts.queries,
        opts.languageCode
      )
  )
  .command(
    'event <eventName>',
    'Detects the intent for a client-generated event name.',
    {},
    opts =>
      detectEventIntent(
        opts.projectId,
        opts.sessionId,
        opts.eventName,
        opts.languageCode
      )
  )
  .command(
    'audio <filename>',
    'Detects the intent for audio queries in a local file.',
    {},
    opts =>
      detectAudioIntent(
        opts.projectId,
        opts.sessionId,
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .command(
    'stream <filename>',
    'Detects the intent in a local audio file by streaming it to the ' +
      'Conversation API.',
    {},
    opts =>
      streamingDetectIntent(
        opts.projectId,
        opts.sessionId,
        opts.filename,
        opts.encoding,
        opts.sampleRateHertz,
        opts.languageCode
      )
  )
  .example(
    'node $0 text -q "hello" "book a room" "Mountain View" ' +
      '"today" "230pm" "half an hour" "two people" "A" "yes"'
  )
  .example('node $0 event order_pizza')
  .example('node $0 audio resources/book_a_room.wav -r 16000')
  .example('node $0 stream resources/mountain_view.wav -r 16000')
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
