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

// [START googlegenaisdk_ctrlgen_with_nested_class_schema]
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

  const Grade = Object.freeze({
    A_PLUS: 'a+',
    A: 'a',
    B: 'b',
    C: 'c',
    D: 'd',
    F: 'f',
  });

  class Recipe {
    /**
     * @param {string} recipeName
     * @param {string} rating - Must be one of Grade enum values
     */
    constructor(recipeName, rating) {
      if (!Object.values(Grade).includes(rating)) {
        throw new Error(`Invalid rating: ${rating}`);
      }
      this.recipeName = recipeName;
      this.rating = rating;
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents:
      'List about 10 home-baked cookies and give them grades based on tastiness.',
    config: {
      responseMimeType: 'application/json',
      responseSchema: Recipe,
    },
  });

  console.log(response.text);

  return response.text;
}
// Example output:
//  [{"rating": "a+", "recipe_name": "Classic Chocolate Chip Cookies"}, ...]
// [END googlegenaisdk_ctrlgen_with_nested_class_schema]

module.exports = {
  generateContent,
};
