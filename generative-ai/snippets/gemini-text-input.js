// Copyright 2024 Google LLC
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

// [START generativeaionvertexai_gemini_generate_from_text_input]
const {GoogleGenAI} = require('@google/genai');
/**
 * TODO(developer): Update these variables before running the sample.
 */
async function generate_from_text_input(
  projectId = 'PROJECT_ID',
  model = 'gemini-2.5-flash'
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: 'us-central1',
  });

  const prompt =
    "What's a good name for a flower shop that specializes in selling bouquets of dried flowers?";

  const response = await client.models.generateContent({
    model: model,
    contents: prompt,
  });

  console.log(response.text);
}
// [END generativeaionvertexai_gemini_generate_from_text_input]

generate_from_text_input(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
