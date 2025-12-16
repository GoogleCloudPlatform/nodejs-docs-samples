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

// [START googlegenaisdk_boundingbox_with_txt_img]
const {GoogleGenAI} = require('@google/genai');

const {createCanvas, loadImage} = require('canvas');
const fetch = require('node-fetch');
const fs = require('fs');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';

async function fetchImageAsBase64(uri) {
  const response = await fetch(uri);
  const buffer = await response.buffer();
  return buffer.toString('base64');
}

async function plotBoundingBoxes(imageUri, boundingBoxes) {
  console.log('Creating bounding boxes');
  const image = await loadImage(imageUri);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');

  ctx.drawImage(image, 0, 0);

  const colors = ['red', 'blue', 'green', 'orange'];

  boundingBoxes.forEach((bbox, i) => {
    const [yMin, xMin, yMax, xMax] = bbox.box_2d;

    const absYMin = Math.floor((yMin / 1000) * image.height);
    const absXMin = Math.floor((xMin / 1000) * image.width);
    const absYMax = Math.floor((yMax / 1000) * image.height);
    const absXMax = Math.floor((xMax / 1000) * image.width);

    ctx.strokeStyle = colors[i % colors.length];
    ctx.lineWidth = 4;
    ctx.strokeRect(absXMin, absYMin, absXMax - absXMin, absYMax - absYMin);

    ctx.fillStyle = colors[i % colors.length];
    ctx.font = '20px Arial';
    ctx.fillText(bbox.label, absXMin + 8, absYMin + 20);
  });

  fs.writeFileSync('output.png', canvas.toBuffer('image/png'));
  console.log('Saved output to file: output.png');
}

async function createBoundingBox(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const systemInstruction = `
    Return bounding boxes as an array with labels.
    Never return masks. Limit to 25 objects.
    If an object is present multiple times, give each object a unique label
    according to its distinct characteristics (colors, size, position, etc).
  `;

  const safetySettings = [
    {
      category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
      threshold: 'BLOCK_ONLY_HIGH',
    },
  ];

  const imageUri =
    'https://storage.googleapis.com/generativeai-downloads/images/socks.jpg';
  const base64Image = await fetchImageAsBase64(imageUri);

  const boundingBoxSchema = {
    type: 'ARRAY',
    description: 'List of bounding boxes for detected objects',
    items: {
      type: 'OBJECT',
      title: 'BoundingBox',
      description: 'Represents a bounding box with coordinates and label',
      properties: {
        box_2d: {
          type: 'ARRAY',
          description:
            'Bounding box coordinates in format [y_min, x_min, y_max, x_max]',
          items: {
            type: 'INTEGER',
            format: 'int32',
          },
          minItems: 4,
          maxItems: 4,
        },
        label: {
          type: 'STRING',
          description: 'Label describing the object within the bounding box',
        },
      },
      required: ['box_2d', 'label'],
    },
  };

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: 'Output the positions of the socks with a face. Label according to position in the image',
          },
          {
            inlineData: {
              data: base64Image,
              mimeType: 'image/jpeg',
            },
          },
        ],
      },
    ],
    config: {
      systemInstruction: systemInstruction,
      safetySettings: safetySettings,
      responseMimeType: 'application/json',
      temperature: 0.5,
      responseSchema: boundingBoxSchema,
    },
  });

  const candidate = response.candidates[0].content.parts[0].text;
  const boundingBoxes = JSON.parse(candidate);

  console.log('Bounding boxes:', boundingBoxes);

  await plotBoundingBoxes(imageUri, boundingBoxes);
  return boundingBoxes;
}
// [END googlegenaisdk_boundingbox_with_txt_img]

module.exports = {
  createBoundingBox,
};
