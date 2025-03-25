// Copyright 2019 Google LLC
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

async function main(
  inFile = 'resources/example.txt',
  outFile = 'resources/example.mp3'
) {
  // [START tts_ssml_address_test]
  /**
   * TODO (developer): Uncomment these variables before running the sample
   *
   */
  // inFile = 'resources/example.txt',
  // outFile = 'resources/example.mp3'
  // [START tts_ssml_address_imports]
  // Imports the Google Cloud client library
  const textToSpeech = require('@google-cloud/text-to-speech');

  // Import other required libraries
  const fs = require('fs');
  //const escape = require('escape-html');
  const util = require('util');
  // [END tts_ssml_address_imports]

  // [START tts_ssml_address_audio]
  /**
   * Generates synthetic audio from a String of SSML text.
   *
   * Given a string of SSML text and an output file name, this function
   * calls the Text-to-Speech API. The API returns a synthetic audio
   * version of the text, formatted according to the SSML commands. This
   * function saves the synthetic audio to the designated output file.
   *
   * ARGS
   * ssmlText: String of tagged SSML text
   * outfile: String name of file under which to save audio output
   * RETURNS
   * nothing
   *
   */
  async function ssmlToAudio(ssmlText, outFile) {
    // Creates a client
    const client = new textToSpeech.TextToSpeechClient();

    // Constructs the request
    const request = {
      // Select the text to synthesize
      input: {ssml: ssmlText},
      // Select the language and SSML Voice Gender (optional)
      voice: {languageCode: 'en-US', ssmlGender: 'MALE'},
      // Select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the Text-to-Speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(outFile, response.audioContent, 'binary');
    console.log('Audio content written to file ' + outFile);
  }
  // [END tts_ssml_address_audio]

  // [START tts_ssml_address_ssml]
  /**
   * Generates SSML text from plaintext.
   *
   * Given an input filename, this function converts the contents of the input text file
   * into a String of tagged SSML text. This function formats the SSML String so that,
   * when synthesized, the synthetic audio will pause for two seconds between each line
   * of the text file. This function also handles special text characters which might
   * interfere with SSML commands.
   *
   * ARGS
   * inputfile: String name of plaintext file
   * RETURNS
   * a String of SSML text based on plaintext input
   *
   */
  function textToSsml(inputFile) {
    let rawLines = '';
    // Read input file
    try {
      rawLines = fs.readFileSync(inputFile, 'utf8');
    } catch (e) {
      console.log('Error:', e.stack);
      return;
    }

    // Replace special characters with HTML Ampersand Character Codes
    // These codes prevent the API from confusing text with SSML tags
    // For example, '<' --> '&lt;' and '&' --> '&amp;'
    let escapedLines = rawLines;
    escapedLines = escapedLines.replace(/&/g, '&amp;');
    escapedLines = escapedLines.replace(/"/g, '&quot;');
    escapedLines = escapedLines.replace(/</g, '&lt;');
    escapedLines = escapedLines.replace(/>/g, '&gt;');

    // Convert plaintext to SSML
    // Tag SSML so that there is a 2 second pause between each address
    const expandedNewline = escapedLines.replace(/\n/g, '\n<break time="2s"/>');
    const ssml = '<speak>' + expandedNewline + '</speak>';

    // Return the concatenated String of SSML
    return ssml;
  }
  // [END tts_ssml_address_ssml]
  const ssml = textToSsml(inFile);
  await ssmlToAudio(ssml, outFile);
  // [END tts_ssml_address_test]
}

main(...process.argv.slice(2)).catch(err => {
  console.error(err.stack);
  process.exitCode = 1;
});
