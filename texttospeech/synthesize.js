/**
 * Copyright 2018, Google, Inc.
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

function synthesizeText(text, outputFile) {
  // [START tts_synthesize_text]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  const client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'Text to synthesize, eg. hello';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  const request = {
    input: {text: text},
    voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }

    fs.writeFile(outputFile, response.audioContent, 'binary', err => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }
      console.log(`Audio content written to file: ${outputFile}`);
    });
  });
  // [END tts_synthesize_text]
}

function synthesizeSsml(ssml, outputFile) {
  // [START tts_synthesize_ssml]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  const client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const ssml = '<speak>Hello there.</speak>';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  const request = {
    input: {ssml: ssml},
    voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }

    fs.writeFile(outputFile, response.audioContent, 'binary', err => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }
      console.log(`Audio content written to file: ${outputFile}`);
    });
  });
  // [END tts_synthesize_ssml]
}

function synthesizeTextFile(textFile, outputFile) {
  // [START tts_synthesize_text_file]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  const client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const textFile = 'Local path to text file, eg. input.txt';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  const request = {
    input: {text: fs.readFileSync(textFile)},
    voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }

    fs.writeFile(outputFile, response.audioContent, 'binary', err => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }
      console.log(`Audio content written to file: ${outputFile}`);
    });
  });
  // [END tts_synthesize_text_file]
}

function synthesizeSsmlFile(ssmlFile, outputFile) {
  // [START tts_synthesize_ssml_file]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  const client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const ssmlFile = 'Local path to SSML file, eg. input.ssml';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  const request = {
    input: {ssml: fs.readFileSync(ssmlFile)},
    voice: {languageCode: 'en-US', ssmlGender: 'FEMALE'},
    audioConfig: {audioEncoding: 'MP3'},
  };

  client.synthesizeSpeech(request, (err, response) => {
    if (err) {
      console.error('ERROR:', err);
      return;
    }

    fs.writeFile(outputFile, response.audioContent, 'binary', err => {
      if (err) {
        console.error('ERROR:', err);
        return;
      }
      console.log(`Audio content written to file: ${outputFile}`);
    });
  });
  // [END tts_synthesize_ssml_file]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(`text <text>`, `Synthesizes audio file from text`, {}, opts =>
    synthesizeText(opts.text, opts.outputFile)
  )
  .command(`ssml <ssml>`, `Synthesizes audio file from SSML`, {}, opts =>
    synthesizeSsml(opts.ssml, opts.outputFile)
  )
  .command(
    `text-file <textFile>`,
    `Synthesizes audio file from text in a file`,
    {},
    opts => synthesizeTextFile(opts.textFile, opts.outputFile)
  )
  .command(
    `ssml-file <ssmlFile>`,
    `Synthesizes audio file from SSML in a file`,
    {},
    opts => synthesizeSsmlFile(opts.ssmlFile, opts.outputFile)
  )
  .options({
    outputFile: {
      alias: 'o',
      default: 'output.mp3',
      global: true,
      requiresArg: true,
      type: 'string',
    },
  })
  .example(`node $0 text "hello" -o hello.mp3`)
  .example(`node $0 ssml "<speak>Hello there.</speak>" -o hello.mp3`)
  .example(`node $0 text-file resources/hello.txt -o output.mp3`)
  .example(`node $0 ssml-file resources/hello.ssml -o output.mp3`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/text-to-speech/docs`
  )
  .help()
  .strict().argv;
