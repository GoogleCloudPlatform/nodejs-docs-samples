const {
  VertexAI,
  HarmBlockThreshold,
  HarmCategory,
} = require('@google-cloud/vertexai');

const project = 'cloud-llm-preview1';
const location = 'us-central1';

// Initialize Vertex with your Cloud project and location
const vertex_ai = new VertexAI({project: project, location: location});

// Instantiate the models
const generativeModel = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-pro',
  // The following parameters are optional
  // They can also be passed to individual content generation requests
  safety_settings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ],
  generation_config: {max_output_tokens: 256},
});

const generativeVisionModel = vertex_ai.preview.getGenerativeModel({
  model: 'gemini-pro-vision',
});

async function streamContentTextOnly() {
  const req = {
    contents: [{role: 'user', parts: [{text: 'How are you doing today?'}]}],
  };

  const streamingResp = await generativeModel.generateContentStream(req);

  for await (const item of streamingResp.stream) {
    console.log('stream chunk:', item);
  }

  console.log('aggregated response: ', await streamingResp.response);
}

async function nonStreamingTextOnly() {
  const req = {
    contents: [{role: 'user', parts: [{text: 'How are you doing today?'}]}],
  };

  const nonstreamingResp = await generativeModel.generateContent(req);
  console.log('non-streaming response: ', await nonstreamingResp.response);
}

async function countTokens() {
  const req = {
    contents: [{role: 'user', parts: [{text: 'How are you doing today?'}]}],
  };

  const countTokensResp = await generativeModel.countTokens(req);
  console.log('count tokens response: ', countTokensResp);
}

async function nonStreamingChat() {
  const chat = generativeModel.startChat({});
  const result1 = await chat.sendMessage('hello');
  console.log('send message result1: ', result1);
  const resp1 = result1.response;
  console.log('send message response1: ', resp1);
  const result2 = await chat.sendMessage('what day is it today?');
  console.log('result2: ', result2);
  const resp2 = result2.response;
  console.log('send message response2: ', resp2);
  const result3 = await chat.sendMessage('what day is it tomorrow?');
  console.log('result3: ', result3);
  const resp3 = result3.response;
  console.log('send message response3: ', resp3);
}

async function streamingChat() {
  const chat = generativeModel.startChat({});
  const streamResult1 = await chat.sendMessageStream('hello again');
  console.log('stream result1: ', streamResult1);
  const streamResp1 = await streamResult1.response;
  console.log('stream send message response1: ', streamResp1);
  const streamResult2 = await chat.sendMessageStream('what is the date today?');
  console.log('stream result2: ', streamResult2);
  const streamResp2 = await streamResult2.response;
  console.log('stream send message response2: ', streamResp2);
  const streamResult3 = await chat.sendMessageStream(
    'what is the date tomorrow?'
  );
  console.log('stream result3: ', streamResult3);
  const streamResp3 = await streamResult3.response;
  console.log('stream send message response3: ', streamResp3);
}

async function multiPartContent() {
  const filePart = {
    file_data: {
      file_uri: 'gs://sararob_imagegeneration_test/kitten.jpeg',
      mime_type: 'image/jpeg',
    },
  };
  const textPart = {text: 'What is this a picture of?'};

  const request = {
    contents: [{role: 'user', parts: [textPart, filePart]}],
  };

  const generativeVisionModel = vertex_ai.preview.getGenerativeModel({
    model: 'gemini-pro-vision',
  });

  const resp = await generativeVisionModel.generateContentStream(request);
  const contentResponse = await resp.response;
  console.log(contentResponse.candidates[0].content);
}

nonStreamingTextOnly();
streamContentTextOnly();
countTokens();
nonStreamingChat();
streamingChat();
multiPartContent();
