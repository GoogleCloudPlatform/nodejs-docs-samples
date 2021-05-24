// Copyright 2021 Google LLC
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

async function main(
  path = 'YOUR_LOCAL_FILE',
  projectId = 'YOUR_GCP_PROJECT',
  modelId = 'YOUR_AUTOML_MODELID'
) {
  // [START video_streaming_automl_object_tracking_beta]
  /**
   * TODO(developer): Uncomment these variables before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';
  // const modelId = 'AutoML model'
  // const projectId = 'Your GCP Project'

  const {StreamingVideoIntelligenceServiceClient} =
    require('@google-cloud/video-intelligence').v1p3beta1;
  const fs = require('fs');

  // Instantiates a client
  const client = new StreamingVideoIntelligenceServiceClient();

  // Streaming configuration
  const modelName = `projects/${projectId}/locations/us-central1/models/${modelId}`;
  const configRequest = {
    videoConfig: {
      feature: 'STREAMING_AUTOML_OBJECT_TRACKING',
      automlObjectTrackingConfig: {
        modelName: modelName,
      },
    },
  };

  const readStream = fs.createReadStream(path, {
    highWaterMark: 5 * 1024 * 1024, //chunk size set to 5MB (recommended less than 10MB)
    encoding: 'base64',
  });
  //Load file content
  // Note: Input videos must have supported video codecs. See
  // https://cloud.google.com/video-intelligence/docs/streaming/streaming#supported_video_codecs
  // for more details.
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
    const annotations = response.annotationResults;
    const objects = annotations.objectAnnotations;
    objects.forEach(object => {
      console.log(`Entity description: ${object.entity.description}`);
      console.log(`Entity id: ${object.entity.entityId}`);
      console.log(`Track id: ${object.trackId}`);
      console.log(`Confidence: ${object.confidence}`);
      console.log(
        `Time offset for the frame: ${
          object.frames[0].timeOffset.seconds || 0
        }` + `.${(object.frames[0].timeOffset.nanos / 1e6).toFixed(0)}s`
      );
      //Every annotation has only one frame.
      const box = object.frames[0].normalizedBoundingBox;
      console.log('Bounding box position:');
      console.log(`\tleft: ${box.left}`);
      console.log(`\ttop: ${box.top}`);
      console.log(`\tright: ${box.right}`);
      console.log(`\tbottom: ${box.bottom}`);
    });
  });
  // [END video_streaming_automl_object_tracking_beta]
}
main(...process.argv.slice(2)).catch(console.error());
