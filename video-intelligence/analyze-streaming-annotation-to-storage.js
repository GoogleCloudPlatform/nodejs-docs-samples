// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

async function main(path = 'YOUR_LOCAL_FILE', outputUri = 'PATH_TO_OUTPUT') {
  // [START video_streaming_annotation_to_storage_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';
  // const outputUri = 'Path to output, e.g. gs://path_to_output';

  const {StreamingVideoIntelligenceServiceClient} =
    require('@google-cloud/video-intelligence').v1p3beta1;
  const fs = require('fs');

  // Instantiates a client
  const client = new StreamingVideoIntelligenceServiceClient();
  // Streaming configuration
  const configRequest = {
    videoConfig: {
      feature: 'STREAMING_LABEL_DETECTION',
      storageConfig: {
        enableStorageAnnotationResult: true,
        annotationResultStorageDirectory: outputUri,
      },
    },
  };
  const readStream = fs.createReadStream(path, {
    highWaterMark: 5 * 1024 * 1024, //chunk size set to 5MB (recommended less than 10MB)
    encoding: 'base64',
  });
  //Load file content
  const chunks = [];
  readStream
    .on('data', chunk => {
      const request = {
        inputContent: chunk.toString(),
      };
      chunks.push(request);
    })
    .on('close', () => {
      // configRequest should be the first in the stream of requests
      stream.write(configRequest);
      for (let i = 0; i < chunks.length; i++) {
        stream.write(chunks[i]);
      }
      stream.end();
    });

  const stream = client.streamingAnnotateVideo().on('data', response => {
    //Gets annotations for video
    console.log(
      `The annotation is stored at: ${response.annotationResultsUri} `
    );
  });
  // [END video_streaming_annotation_to_storage_beta]
}

main(...process.argv.slice(2)).catch(console.error());
