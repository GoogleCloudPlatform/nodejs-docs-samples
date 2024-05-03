// [START generativeaionvertexai_non_stream_multimodality_basic]
const {VertexAI} = require('@google-cloud/vertexai');

/**
 * TODO(developer): Update these variables before running the sample.
 */
async function generateContent(
  projectId = 'PROJECT_ID',
  location = 'us-central1',
  model = 'gemini-1.5-pro-preview-0409'
) {
  // Initialize Vertex AI
  const vertexAI = new VertexAI({project: projectId, location: location});
  const generativeModel = vertexAI.getGenerativeModel({model: model});

  const request = {
    contents: [
      {
        role: 'user',
        parts: [
          {text: 'Are following video and image correlated?'},
          {
            file_data: {
              file_uri: 'gs://cloud-samples-data/video/animals.mp4',
              mime_type: 'video/mp4',
            },
          },
          {
            file_data: {
              file_uri: 'gs://generativeai-downloads/images/character.jpg',
              mime_type: 'video/mp4',
            },
          },
        ],
      },
    ],
  };

  const result = await generativeModel.generateContent(request);

  console.log(result.response.candidates[0].content.parts[0].text);
}
// [END generativeaionvertexai_non_stream_multimodality_basic]

generateContent(...process.argv.slice(2)).catch(err => {
  console.error(err.message);
  process.exitCode = 1;
});
