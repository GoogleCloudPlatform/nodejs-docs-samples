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

// [START googlegenaisdk_live_structured_output_with_txt]

'use strict';
const {OpenAI} = require('openai');
const {GoogleAuth} = require('google-auth-library');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const CalendarEventSchema = {
  type: 'object',
  properties: {
    name: {type: 'string'},
    date: {type: 'string'},
    participants: {
      type: 'array',
      items: {type: 'string'},
    },
  },
  required: ['name', 'date', 'participants'],
};

async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  const client = await auth.getClient();
  const tokenResponse = await client.getAccessToken();

  const token = tokenResponse.token;

  const ENDPOINT_ID = 'openapi';
  const baseURL = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/endpoints/${ENDPOINT_ID}`;

  const openAI = new OpenAI({
    apiKey: token,
    baseURL: baseURL,
  });

  const completion = await openAI.chat.completions.create({
    model: 'google/gemini-2.0-flash-001',
    messages: [
      {role: 'system', content: 'Extract the event information.'},
      {
        role: 'user',
        content: 'Alice and Bob are going to a science fair on Friday.',
      },
    ],
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'CalendarEvent',
        schema: CalendarEventSchema,
      },
    },
  });

  const response = completion.choices[0].message.content;
  console.log(response);

  // Example expected output:
  // {
  //   name: 'science fair',
  //   date: 'Friday',
  //   participants: ['Alice', 'Bob']
  // }

  return response;
}

// [END googlegenaisdk_live_structured_output_with_txt]

module.exports = {
  generateContent,
};
