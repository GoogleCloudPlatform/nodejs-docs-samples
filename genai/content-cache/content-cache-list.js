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

// [START googlegenaisdk_contentcache_list]

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

  const contentCacheList = await ai.caches.list();

  // Access individual properties of a ContentCache object(s)
  const contentCacheNames = [];
  for (const contentCache of contentCacheList.pageInternal) {
    console.log(
      `Cache \`${contentCache.name}\` for model \`${contentCache.model}\``
    );
    console.log(`Last updated at: ${contentCache.updateTime}`);
    console.log(`Expires at: ${contentCache.expireTime}`);
    contentCacheNames.push(contentCache.name);
  }
  console.log(contentCacheNames);

  // Example response:
  //  * Cache `projects/111111111111/locations/us-central1/cachedContents/1111111111111111111` for
  //  model `projects/111111111111/locations/us-central1/publishers/google/models/gemini-XXX-pro-XXX`
  //  * Last updated at: 2025-02-13 14:46:42.620490+00:00
  //  * CachedContentUsageMetadata(audio_duration_seconds=None, image_count=167, text_count=153, total_token_count=43130, video_duration_seconds=None)
  // ...

  return contentCacheNames;
}

// [END googlegenaisdk_contentcache_list]

module.exports = {
  generateContent,
};
