// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START googlegenaisdk_live_conversation_audio_with_audio]

'use strict';

const fs = require('fs');
const path = require('path');
const {GoogleGenAI, Modality} = require('@google/genai');

const MODEL = 'gemini-2.0-flash-live-preview-04-09';
const INPUT_RATE = 16000;
const OUTPUT_RATE = 24000;
const SAMPLE_WIDTH = 2; // 16-bit

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

function readWavefile(filepath) {
  const buffer = fs.readFileSync(filepath);
  const audioBytes = buffer.subarray(44);
  const base64Data = audioBytes.toString('base64');
  const mimeType = `audio/pcm;rate=${INPUT_RATE}`;
  return {base64Data, mimeType};
}

// Utility: write bytes -> .wav file
function writeWavefile(filepath, audioFrames, rate = OUTPUT_RATE) {
  const rawAudioBytes = Buffer.concat(audioFrames);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + rawAudioBytes.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(rate, 24);
  header.writeUInt32LE(rate * SAMPLE_WIDTH, 28);
  header.writeUInt16LE(SAMPLE_WIDTH, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(rawAudioBytes.length, 40);

  fs.writeFileSync(filepath, Buffer.concat([header, rawAudioBytes]));
  console.log(`Model response saved to ${filepath}`);
}

async function generateLiveConversation(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  console.log('Starting audio conversation sample...');
  console.log(`Project: ${projectId}, Location: ${location}`);

  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const responseQueue = [];

  async function waitMessage(timeoutMs = 60 * 1000) {
    const startTime = Date.now();

    while (responseQueue.length === 0) {
      if (Date.now() - startTime > timeoutMs) {
        console.warn('No messages received within timeout. Exiting...');
        return null; // timeout occurred
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return responseQueue.shift();
  }

  async function handleTurn() {
    const audioFrames = [];
    let done = false;

    while (!done) {
      const message = await waitMessage();
      const sc = message.serverContent;

      if (sc && sc.inputTranscription) {
        console.log('Input transcription', sc.inputTranscription);
      }
      if (sc && sc.outputTranscription) {
        console.log('Output transcription', sc.outputTranscription);
      }
      if (sc && sc.modelTurn && sc.modelTurn.parts) {
        for (const part of sc.modelTurn.parts) {
          if (part && part.inlineData && part.inlineData.data) {
            const audioData = Buffer.from(part.inlineData.data, 'base64');
            audioFrames.push(audioData);
          }
        }
      }
      if (sc && sc.turnComplete) {
        done = true;
      }
    }

    return audioFrames;
  }

  const session = await client.live.connect({
    model: MODEL,
    config: {
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onmessage: msg => responseQueue.push(msg),
      onerror: e => console.error(e.message),
      onclose: () => console.log('Closed'),
    },
  });

  const wavFilePath = path.join(__dirname, 'hello_gemini_are_you_there.wav');
  console.log('Reading file:', wavFilePath);

  const {base64Data, mimeType} = readWavefile(wavFilePath);
  const audioBytes = Buffer.from(base64Data, 'base64');

  await session.sendRealtimeInput({
    media: {
      data: audioBytes.toString('base64'),
      mimeType: mimeType,
    },
  });

  console.log('Audio sent, waiting for response...');

  const audioFrames = await handleTurn();
  if (audioFrames.length > 0) {
    writeWavefile(
      path.join(__dirname, 'example_model_response.wav'),
      audioFrames,
      OUTPUT_RATE
    );
  }

  await session.close();
  return audioFrames;
}

// [END googlegenaisdk_live_conversation_audio_with_audio]

module.exports = {
  generateLiveConversation,
};
