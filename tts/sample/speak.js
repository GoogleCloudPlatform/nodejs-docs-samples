/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function listVoices (langs, gender) {
  console.log(`Listing available voices for synthesis.`);
  const TTS = require(`texttospeech`);
  const tts = TTS(
      { servicePath: 'staging-texttospeech.sandbox.googleapis.com' });

  let filter = {};

  if (langs && gender && langs.length > 0 && gender.length > 0) {
    filter.filter = `language_codes:${langs} AND gender=${gender}`;
  } else if (gender && gender.length > 0) {
    filter.filter = `gender=${gender}`;
  } else if (langs && langs.length > 0) {
    filter.filter = `language_codes:"${langs}"`;
  }
  tts.listVoices(filter, function (err, resp) {
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      let voices = resp.voices;
      voices.forEach((voice) => {
        console.log(`Name: ${voice.name}`);
        console.log(`\tGender: ${voice.gender}`);
        console.log(`\tRate Hz: ${voice.naturalSampleRateHertz}`);
        console.log(`\tLanguages: ${JSON.stringify(voice.languageCodes)}`);
      });
    }
    return resp.voices;
  });
}

function synthesizeSsml (ssml) {
  const fs = require('fs');
  const TTS = require(`texttospeech`);
  const tts = TTS(
      { servicePath: 'staging-texttospeech.sandbox.googleapis.com' });
  const input = {ssml: ssml};
  const audioConfig = {
    audioEncoding: TTS.types.AudioEncoding.values.MP3
  };
  const out = 'output.mp3';
  let voiceName = 'gba-vocoded'; // auc-vocoded, etc..

  let request = {
    input: input,
    voice: { name: voiceName, languageCode: 'en-gb' },
    audioConfig: audioConfig
  };

  tts.synthesizeSpeech(request, (err, resp) => {
    if (err) {
      console.log(`Error: ${err}`);
    } else {
        // Decode Base64 response to file
      fs.writeFile(out, Buffer.from(resp.audioContent, 'base64'), (err) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Synthesized SSML to ${out}.`);
      });
    }
  });
}

function synthesizeText (text) {
  const fs = require('fs');
  const TTS = require(`texttospeech`);
  const tts = TTS(
      { servicePath: 'staging-texttospeech.sandbox.googleapis.com' });
  const input = {text: text};
  const audioConfig = {
    audioEncoding: TTS.types.AudioEncoding.values.MP3
  };
  const out = 'output.mp3';
  let voiceName = 'gba-vocoded'; // auc-vocoded, etc..

  let request = {
    input: input,
    voice: { name: voiceName, languageCode: 'en-gb' },
    audioConfig: audioConfig
  };

  tts.synthesizeSpeech(request, (err, resp) => {
    if (err) {
      console.log(`Error: ${err}`);
    } else {
        // Decode Base64 response to file
      fs.writeFile(out, Buffer.from(resp.audioContent, 'base64'), (err) => {
        if (err) {
          console.log(err);
          return;
        }

        console.log(`Synthesized ${text} to ${out}.`);
      });
    }
  });
}

function synthesizeFile (filepath) {
  const fs = require('fs');
  const TTS = require(`texttospeech`);

  fs.readFile(filepath, (err, text) => {
    if (err) {
      console.log(`Error reading file: ${err}`);
      return;
    }
    const tts = TTS(
        { servicePath: 'staging-texttospeech.sandbox.googleapis.com' });
    const input = {text: text};
    const audioConfig = {
      audioEncoding: TTS.types.AudioEncoding.values.MP3
    };
    const out = 'output.mp3';
    const voice = { name: 'ana', languageCode: 'es-es' };

    let request = {
      input: input,
      voice: voice,
      audioConfig: audioConfig
    };

    tts.synthesizeSpeech(request, (err, resp) => {
      if (err) {
        console.log(`Error: ${err}`);
      } else {
          // Writes the Base64 response to disk
        let audio = resp.audioContent;
        fs.writeFile(out, Buffer.from(audio, 'base64'), (err) => {
          if (err) {
            console.log(err);
            return;
          }

          console.log(`Synthesized ${filepath} to ${out}.`);
        });
      }
    });
  });
}

function synthesizeSsmlFile (filepath) {
  const fs = require('fs');
  const TTS = require(`texttospeech`);

  fs.readFile(filepath, (err, ssml) => {
    if (err) {
      console.log(`Error: ${err}`);
    } else {
      const tts = TTS(
          { servicePath: 'staging-texttospeech.sandbox.googleapis.com' });
      const input = {ssml: ssml};
      const audioConfig = {
        audioEncoding: TTS.types.AudioEncoding.values.MP3
      };
      const out = 'output.mp3';
      const voice = { name: 'frc-vocoded', languageCode: 'fr-fr' };

      let request = {
        input: input,
        voice: voice,
        audioConfig: audioConfig
      };

      tts.synthesizeSpeech(request, (err, resp) => {
        if (err) {
          console.log(`Error: ${err}`);
        } else {
            // Writes the Base64 response to disk
          let audio = resp.audioContent;
          fs.writeFile(out, Buffer.from(audio, 'base64'), (err) => {
            if (err) {
              console.log(err);
              return;
            }

            console.log(`Synthesized ${filepath} to ${out}.`);
          });
        }
      });
    }
  });
}

const ssmlString = `"<?xml version=\\"1.0\\"?> \\\n` +
  `<speak version=\\"1.0\\" xmlns=\\"http://www.w3.org/2001/10/synthesis\\" \\\n` +
  `  xmlns:xsi=\\"http://www.w3.org/2001/XMLSchema-instance\\" \\\n` +
  `  xsi:schemaLocation=\\"http://www.w3.org/2001/10/synthesis \\\n` +
  `  http://www.w3.org/TR/speech-synthesis/synthesis.xsd\\" xml:lang=\\"en-US\\"> \\\n` +
  `   Hello there. \\\n` +
  ` </speak>"`;
require(`yargs`) // eslint-disable-line
  .demand(1)
  .command(
    `list-voices <lang> <gender>`,
    `List the voices available for speech synthesis.`,
    {},
    (opts) => listVoices(opts.lang, opts.gender)
  )
  .command(
    `synthesize <text>`,
    `Synthesizes the text passed to the sample app.`,
    {},
    (opts) => synthesizeText(opts.text)
  )
  .command(
    `synthesize-ssml <ssml>`,
    `Synthesizes the SSML passed to the sample app.`,
    {},
    (opts) => synthesizeSsml(opts.ssml)
  )
  .command(
    `synthesize-file <filepath>`,
    `Synthesizes the text in the file passed to the sample app.`,
    {},
    (opts) => synthesizeFile(opts.filepath)
  )
  .command(
    `synthesize-ssmlFile <filepath>`,
    `Synthesizes the SSML in the file passed to the sample app.`,
    {},
    (opts) => synthesizeSsmlFile(opts.filepath)
  )
  .example(`node $0 list-voices "en" FEMALE`)
  .example(`node $0 synthesize "Take me to your leader."`)
  .example(`node $0 synthesize-ssml ${ssmlString}`)
  .example(`node $0 synthesize-file resources/text.txt`)
  .example(`node $0 synthesize-ssmlFile resources/ssml.xml`)
  .wrap(120)
  .recommendCommands()
  .epilogue(`For more information, see https://cloud.google.com/tts/docs`)
  .help()
  .strict()
  .argv;
