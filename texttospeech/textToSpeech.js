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

function listVoices() {
  // [START tts_list_voices]
  const textToSpeech = require('@google-cloud/text-to-speech');

  var client = new textToSpeech.TextToSpeechClient();

  client.listVoices({})
    .then(results => {
      const voices = results[0].voices;

      console.log('Voices:');
      voices.forEach((voice) => {
        console.log(`Name: ${voice.name}`);
        console.log(`  SSML Gender: ${voice.ssmlGender}`);
        console.log(`  Natural Sample Rate Hertz: ${voice.naturalSampleRateHertz}`)
        console.log(`  Supported languages:`)
        voice.languageCodes.forEach((languageCode) => {
          console.log(`    ${languageCode}`);
        });
      })
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END tts_list_voices]
}

function synthesizeText(text, outputFile) {
  // [START tts_synthesize_text]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  var client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const text = 'Text to synthesize, eg. hello';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  var request = {
    input: { text: text },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  client.synthesizeSpeech(request)
  .then(results => {
      const audioContent = results[0].audioContent;

      fs.writeFileSync(outputFile, audioContent, 'binary');
      console.log(`Saved synthesized text to local audio file ${outputFile}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END tts_synthesize_text]
}

function synthesizeSsml(ssml, outputFile) {
  // [START tts_synthesize_ssml]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  var client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const ssml = 'SSML to synthesize, eg. <?xml version="1.0"?><speak...';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  var request = {
    input: { ssml: ssml },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  client.synthesizeSpeech(request)
  .then(results => {
      const audioContent = results[0].audioContent;

      fs.writeFileSync(outputFile, audioContent, 'binary');
      console.log(`Saved synthesized text to local audio file ${outputFile}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END tts_synthesize_ssml]
}

function synthesizeTextFile(textFile, outputFile) {
  // [START tts_synthesize_text_file]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  var client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const textFile = 'Local path to text file, eg. input.txt';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  var request = {
    input: { text: fs.readFileSync(textFile) },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  client.synthesizeSpeech(request)
  .then(results => {
      const audioContent = results[0].audioContent;

      fs.writeFileSync(outputFile, audioContent, 'binary');
      console.log(`Saved synthesized text to local audio file ${outputFile}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END tts_synthesize_text_file]
}

function synthesizeSsmlFile(ssmlFile, outputFile) {
  // [START tts_synthesize_ssml_file]
  const textToSpeech = require('@google-cloud/text-to-speech');
  const fs = require('fs');

  var client = new textToSpeech.TextToSpeechClient();

  /**
   * TODO(developer): Uncomment the following lines before running the sample.
   */
  // const ssmlFile = 'Local path to SSML file, eg. input.ssml';
  // const outputFile = 'Local path to save audio file to, e.g. output.mp3';

  var request = {
    input: { ssml: fs.readFileSync(ssmlFile) },
    voice: { languageCode: 'en-US', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  client.synthesizeSpeech(request)
  .then(results => {
      const audioContent = results[0].audioContent;

      fs.writeFileSync(outputFile, audioContent, 'binary');
      console.log(`Saved synthesized text to local audio file ${outputFile}`);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END tts_synthesize_ssml_file]
}

require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `list-voices`,
    `List supported languages.`,
    {},
    opts => listVoices()
  )
  .command(
    `synthesize-text <text>`,
    `Synthesizes audio file from text`,
    {},
    opts => synthesizeText(opts.text, opts.outputFile)
  )
  .command(
    `synthesize-ssml <ssml>`,
    `Synthesizes audio file from SSML`,
    {},
    opts => synthesizeSsml(opts.ssml, opts.outputFile)
  )
  .command(
    `synthesize-text-file <textFile>`,
    `Synthesizes audio file from text in a file`,
    {},
    opts => synthesizeTextFile(opts.textFile, opts.outputFile)
  )
  .command(
    `synthesize-ssml-file <ssmlFile>`,
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
      type: 'string'
    }
  })
  .example(`node $0 list-voices`)
  .example(`node $0 synthesize-text "hello" -o hello.mp3`)
  .example(`node $0 synthesize-ssml "<?xml..." -o hello.mp3`)
  .example(`node $0 synthesize-text-file filename.txt -o output.mp3`)
  .example(`node $0 synthesize-ssml-file filename.ssml -o output.mp3`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/text-to-speech/docs`)
  .help()
  .strict().argv;
