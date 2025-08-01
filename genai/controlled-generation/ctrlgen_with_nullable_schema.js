// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

// [START googlegenaisdk_ctrlgen_with_nullable_schema]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  class InstrumentClass {
    static PERCUSSION = "Percussion";
    static STRING = "String";
    static WOODWIND = "Woodwind";
    static BRASS = "Brass";
    static KEYBOARD = "Keyboard";

    static values() {
      return [
        this.PERCUSSION,
        this.STRING,
        this.WOODWIND,
        this.BRASS,
        this.KEYBOARD
      ];
    }
  }

  const responseSchema = {
    type: "string",
    enum: InstrumentClass.values(),
  };


  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'What type of instrument is a guitar?',
    config: {
      responseMimeType: 'text/x.enum',
      responseSchema: responseSchema,
    },
  });
  console.log(response);

  console.log(response.text);

  return response.text;
}
// [END googlegenaisdk_ctrlgen_with_nullable_schema]

module.exports = {
  generateContent,
};