'use strict';

const fs = require('fs');
const {GoogleGenAI} = require('@google/genai');

const GOOGLE_CLOUD_PROJECT = process.env.GOOGLE_CLOUD_PROJECT;
const GOOGLE_CLOUD_LOCATION =
  process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

async function virtualTryOn(
  projectId = GOOGLE_CLOUD_PROJECT,
  location = GOOGLE_CLOUD_LOCATION
) {
  const client = new GoogleGenAI({
    vertexai: true,
    project: projectId,
    location: location,
  });

  const source = {
    personImage: {
      imageBytes: fs
        .readFileSync('september-samples/man.png')
        .toString('base64'),
    },
    productImages: [
      {
        productImage: {
          imageBytes: fs
            .readFileSync('september-samples/sweater.jpg')
            .toString('base64'),
        },
      },
    ],
  };

  const image = await client.models.recontextImage({
    model: 'virtual-try-on-preview-08-04',
    source: source,
  });

  console.log('Created output image');
  const imageBytes = image.generatedImages[0].image.imageBytes;
  const buffer = Buffer.from(imageBytes, 'base64');
  fs.writeFileSync('image.png', buffer);

  return image.generatedImages[0];
}

module.exports = {
  virtualTryOn,
};
