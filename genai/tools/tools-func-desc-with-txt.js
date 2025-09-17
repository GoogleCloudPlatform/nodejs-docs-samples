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

// [START googlegenaisdk_tools_func_desc_with_txt]
const {GoogleGenAI, Type} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
async function generateFunctionDesc(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const get_album_sales = {
    name: 'get_album_sales',
    description: 'Gets the number of albums sold',
    parameters: {
      type: Type.OBJECT,
      properties: {
        albums: {
          type: Type.ARRAY,
          description: 'List of albums',
          items: {
            description: 'Album and its sales',
            type: Type.OBJECT,
            properties: {
              album_name: {
                type: Type.STRING,
                description: 'Name of the music album',
              },
              copies_sold: {
                type: Type.INTEGER,
                description: 'Number of copies sold',
              },
            },
          },
        },
      },
    },
  };

  const sales_tool = {
    functionDeclarations: [get_album_sales],
  };

  const prompt = `
    At Stellar Sounds, a music label, 2024 was a rollercoaster. "Echoes of the Night", a debut synth-pop album, 
    surprisingly sold 350,000 copies, while veteran rock band "Crimson Tide's" latest, "Reckless Hearts",
    lagged at 120,000. Their up-and-coming indie artist, "Luna Bloom's" EP, "Whispers of Dawn",
    secured 75,000 sales. The biggest disappointment was the highly-anticipated rap album "Street Symphony" 
    only reaching 100,000 units. Overall, Stellar Sounds moved over 645,000 units this year, revealing unexpected
    trends in music consumption.
  `;

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      tools: [sales_tool],
      temperature: 0,
    },
  });
  const output = JSON.stringify(response.functionCalls, null, 2);
  console.log(output);

  // Example response:
  //    [FunctionCall(
  //     id=None,
  //     name="get_album_sales",
  //     args={
  //         "albums": [
  //             {"album_name": "Echoes of the Night", "copies_sold": 350000},
  //             {"copies_sold": 120000, "album_name": "Reckless Hearts"},
  //             {"copies_sold": 75000, "album_name": "Whispers of Dawn"},
  //             {"copies_sold": 100000, "album_name": "Street Symphony"},
  //          ]
  //      },
  //     )]

  return output;
}

// [END googlegenaisdk_tools_func_desc_with_txt]

module.exports = {
  generateFunctionDesc,
};
