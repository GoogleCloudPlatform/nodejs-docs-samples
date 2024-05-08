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

// laishers. "A New Era in Cartoon History." Review of Steamboat Willie.
// 4 January 2001. https://www.imdb.com/review/rw0005574/?ref_=rw_urv

// [START generativeaionvertexai_gemini_generate_from_text_input]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function generate_from_text_input(projectId = 'PROJECT_ID') {
  const vertexAI = new VertexAI({project: projectId, location: 'us-central1'});

  const generativeModel = vertexAI.getGenerativeModel({
    model: 'gemini-1.0-pro-002',
  });

  // Movie review from https://www.imdb.com/review/rw0005574/?ref_=rw_urv.
  // Does the returned sentiment score match the reviewer's movie rating?
  const textPart = {
    text: `
    Give a score from 1 - 10 to suggest if the following movie review is
    negative or positive (1 is most negative, 10 is most positive, 5 will be
    neutral). Include an explanation.

    This era was not just the dawn of sound in cartoons, but of a cartoon
    character which would go down in history as the world's most famous mouse.
    Yes, Mickey makes his debut here, in this cheery tale of life on board a
    steamboat. The animation is good for it's time, and the plot - though a
    little simple - is quite jolly. A true classic, and if you ever manage to
    get it on video, you won't regret it.`,
  };

  const request = {
    contents: [{role: 'user', parts: [textPart]}],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = await resp.response;
  console.log(JSON.stringify(contentResponse));
}
// [END generativeaionvertexai_gemini_generate_from_text_input]

generate_from_text_input(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
