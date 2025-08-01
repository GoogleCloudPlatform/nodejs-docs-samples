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

'use strict';

// [START googlegenaisdk_contentcache_create_with_txt_gcs_pdf]

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
    httpOptions: {
      apiVersion: 'v1',
    },
  });

  const systemInstruction = `
  You are an expert researcher. You always stick to the facts in the sources provided, and never make up new facts.
  Now look at these research papers, and answer the following questions.
  `;

  const contents = [
    {
      role: 'user',
      parts: [
        {
          fileData: {
            fileUri:
              'gs://cloud-samples-data/generative-ai/pdf/2312.11805v3.pdf',
            mimeType: 'application/pdf',
          },
        },
        {
          fileData: {
            fileUri: 'gs://cloud-samples-data/generative-ai/pdf/2403.05530.pdf',
            mimeType: 'application/pdf',
          },
        },
      ],
    },
  ];

  const contentCache = await ai.caches.create({
    model: 'gemini-2.5-flash',
    config: {
      contents: contents,
      systemInstruction: systemInstruction,
      displayName: 'example-cache',
      ttl: '86400s',
    },
  });

  console.log(contentCache);
  console.log(contentCache.name);

  return contentCache.name;
}

// [END googlegenaisdk_contentcache_create_with_txt_gcs_pdf]

module.exports = {
  generateContent,
};
