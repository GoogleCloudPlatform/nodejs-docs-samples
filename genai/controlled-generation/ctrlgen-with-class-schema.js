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

// [START googlegenaisdk_ctrlgen_with_class_schema]
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

  class Recipe {
    /**
     * @param {string} recipeName
     * @param {string[]} ingredients
     */
    constructor(recipeName, ingredients) {
      this.recipeName = recipeName;
      this.ingredients = ingredients;
    }
  }

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'List a few popular cookie recipes?',
    config: {
      responseMimeType: 'application/json',
      responseSchema: Recipe,
    },
  });

  console.log(response.text);
  return response.text;
}
// Example output:
// [Recipe(recipe_name='Chocolate Chip Cookies', ingredients=['2 1/4 cups all-purpose flour'
//   {
//     "ingredients": [
//       "2 1/4 cups all-purpose flour",
//       "1 teaspoon baking soda",
//       "1 teaspoon salt",
//       "1 cup (2 sticks) unsalted butter, softened",
//       "3/4 cup granulated sugar",
//       "3/4 cup packed brown sugar",
//       "1 teaspoon vanilla extract",
//       "2 large eggs",
//       "2 cups chocolate chips"
//     ],
//     "recipe_name": "Classic Chocolate Chip Cookies"
//   }, ... ]
// [END googlegenaisdk_ctrlgen_with_class_schema]

module.exports = {
  generateContent,
};
