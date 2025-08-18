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

// [START googlegenaisdk_embeddings_docretrieval_with_txt]
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'global';
//todo notworking
async function generateContent(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {

  /**
   * Represents a bounding box with its 2D coordinates and associated label.
   */
  class BoundingBox {
    /**
     * @param {number[]} box2d - A list of integers representing the 2D coordinates of the bounding box
     *                           in the format [y_min, x_min, y_max, x_max].
     * @param {string} label - The label or class associated with the object in the bounding box.
     */
    constructor(box2d, label) {
      if (!Array.isArray(box2d) || box2d.length !== 4 || !box2d.every(Number.isInteger)) {
        throw new Error('box2d must be an array of 4 integers');
      }
      if (typeof label !== 'string') {
        throw new Error('label must be a string');
      }
      this.box2d = box2d;
      this.label = label;
    }
  }

  /**
   * Helper function to plot bounding boxes on an image
   * @param {string} imageUri
   * @param {BoundingBox[]} boundingBoxes
   */
  async function plotBoundingBoxes(imageUri, boundingBoxes) {
    const image = await loadImage(imageUri);
    const width = image.width;
    const height = image.height;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    ctx.drawImage(image, 0, 0, width, height);

    const colors = ['red', 'green', 'blue', 'orange', 'purple', 'yellow', 'cyan', 'magenta', 'lime', 'pink'];

    boundingBoxes.forEach((bbox, i) => {
      const absYMin = Math.floor((bbox.box2d[0] / 1000) * height);
      const absXMin = Math.floor((bbox.box2d[1] / 1000) * width);
      const absYMax = Math.floor((bbox.box2d[2] / 1000) * height);
      const absXMax = Math.floor((bbox.box2d[3] / 1000) * width);

      const color = colors[i % colors.length];

      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.strokeRect(absXMin, absYMin, absXMax - absXMin, absYMax - absYMin);

      if (bbox.label) {
        ctx.fillStyle = color;
        ctx.font = '20px Arial';
        ctx.fillText(bbox.label, absXMin + 8, absYMin + 20);
      }
    });

    // Save or return buffer
    return canvas.toBuffer('image/png');
  }

  const ai = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const systemInstructions = 'Return bounding boxes as an array with labels.\n' +
    '        Never return masks. Limit to 25 objects.\n' +
    '        If an object is present multiple times, give each object a unique label\n' +
    '        according to its distinct characteristics (colors, size, position, etc..).'

  const imageUri = "https://storage.googleapis.com/generativeai-downloads/images/socks.jpg";

  const prompt = [
    { file_uri: imageUri, mime_type: 'image/jpeg' }, // zamiast Part.fromUri
    "Output the positions of the socks with a face. Label according to position in the image."
  ];

  const config = {
    systemInstructions: systemInstructions,
    temperature: 0.5,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
    responseMimeType: 'application/json'
  };


  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: config
  });

  console.log(response.text);

  let boundingBoxes = [];
  try {
    boundingBoxes = JSON.parse(response.text).map(b => new BoundingBox(b.box_2d, b.label));
  } catch (err) {
    console.error('Failed to parse response:', err);
  }

  await plotBoundingBoxes(imageUri, boundingBoxes);


  return response;
}
// [END googlegenaisdk_embeddings_docretrieval_with_txt]

module.exports = {
  generateContent,
};
