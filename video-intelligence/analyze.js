// Copyright 2017 Google LLC
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

async function analyzeLabelsGCS(gcsUri) {
  // [START video_analyze_labels_gcs]
  // Imports the Google Cloud Video Intelligence library
  const video = require('@google-cloud/video-intelligence').v1;

  // Creates a client
  const client = new video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

  const request = {
    inputUri: gcsUri,
    features: ['LABEL_DETECTION'],
  };

  // Detects labels in a video
  const [operation] = await client.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [operationResult] = await operation.promise();

  // Gets annotations for video
  const annotations = operationResult.annotationResults[0];

  const labels = annotations.segmentLabelAnnotations;
  labels.forEach(label => {
    console.log(`Label ${label.entity.description} occurs at:`);
    label.segments.forEach(segment => {
      const time = segment.segment;
      if (time.startTimeOffset.seconds === undefined) {
        time.startTimeOffset.seconds = 0;
      }
      if (time.startTimeOffset.nanos === undefined) {
        time.startTimeOffset.nanos = 0;
      }
      if (time.endTimeOffset.seconds === undefined) {
        time.endTimeOffset.seconds = 0;
      }
      if (time.endTimeOffset.nanos === undefined) {
        time.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${time.startTimeOffset.seconds}` +
          `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${time.endTimeOffset.seconds}.` +
          `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(`\tConfidence: ${segment.confidence}`);
    });
  });
  // [END video_analyze_labels_gcs]
}

async function analyzeLabelsLocal(path) {
  // [START video_analyze_labels]
  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const video = require('@google-cloud/video-intelligence').v1;
  const fs = require('fs');
  const util = require('util');

  // Creates a client
  const client = new video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';

  // Reads a local video file and converts it to base64
  const readFile = util.promisify(fs.readFile);
  const file = await readFile(path);
  const inputContent = file.toString('base64');

  // Constructs request
  const request = {
    inputContent: inputContent,
    features: ['LABEL_DETECTION'],
  };

  // Detects labels in a video
  const [operation] = await client.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [operationResult] = await operation.promise();
  // Gets annotations for video
  const annotations = operationResult.annotationResults[0];

  const labels = annotations.segmentLabelAnnotations;
  labels.forEach(label => {
    console.log(`Label ${label.entity.description} occurs at:`);
    label.segments.forEach(segment => {
      const time = segment.segment;
      if (time.startTimeOffset.seconds === undefined) {
        time.startTimeOffset.seconds = 0;
      }
      if (time.startTimeOffset.nanos === undefined) {
        time.startTimeOffset.nanos = 0;
      }
      if (time.endTimeOffset.seconds === undefined) {
        time.endTimeOffset.seconds = 0;
      }
      if (time.endTimeOffset.nanos === undefined) {
        time.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${time.startTimeOffset.seconds}` +
          `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${time.endTimeOffset.seconds}.` +
          `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(`\tConfidence: ${segment.confidence}`);
    });
  });

  // [END video_analyze_labels]
}

async function analyzeShots(gcsUri) {
  // [START video_analyze_shots]
  // Imports the Google Cloud Video Intelligence library
  const video = require('@google-cloud/video-intelligence').v1;

  // Creates a client
  const client = new video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of file to analyze, e.g. gs://my-bucket/my-video.mp4';

  const request = {
    inputUri: gcsUri,
    features: ['SHOT_CHANGE_DETECTION'],
  };

  // Detects camera shot changes
  const [operation] = await client.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [operationResult] = await operation.promise();
  // Gets shot changes
  const shotChanges = operationResult.annotationResults[0].shotAnnotations;
  console.log('Shot changes:');

  if (shotChanges.length === 1) {
    console.log('The entire video is one shot.');
  } else {
    shotChanges.forEach((shot, shotIdx) => {
      console.log(`Scene ${shotIdx} occurs from:`);
      if (shot.startTimeOffset === undefined) {
        shot.startTimeOffset = {};
      }
      if (shot.endTimeOffset === undefined) {
        shot.endTimeOffset = {};
      }
      if (shot.startTimeOffset.seconds === undefined) {
        shot.startTimeOffset.seconds = 0;
      }
      if (shot.startTimeOffset.nanos === undefined) {
        shot.startTimeOffset.nanos = 0;
      }
      if (shot.endTimeOffset.seconds === undefined) {
        shot.endTimeOffset.seconds = 0;
      }
      if (shot.endTimeOffset.nanos === undefined) {
        shot.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${shot.startTimeOffset.seconds}` +
          `.${(shot.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${shot.endTimeOffset.seconds}.` +
          `${(shot.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
    });
  }

  // [END video_analyze_shots]
}

async function analyzeSafeSearch(gcsUri) {
  // [START video_analyze_explicit_content]
  // Imports the Google Cloud Video Intelligence library
  const video = require('@google-cloud/video-intelligence').v1;

  // Creates a client
  const client = new video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of video to analyze, e.g. gs://my-bucket/my-video.mp4';

  const request = {
    inputUri: gcsUri,
    features: ['EXPLICIT_CONTENT_DETECTION'],
  };

  // Human-readable likelihoods
  const likelihoods = [
    'UNKNOWN',
    'VERY_UNLIKELY',
    'UNLIKELY',
    'POSSIBLE',
    'LIKELY',
    'VERY_LIKELY',
  ];

  // Detects unsafe content
  const [operation] = await client.annotateVideo(request);
  console.log('Waiting for operation to complete...');
  const [operationResult] = await operation.promise();
  // Gets unsafe content
  const explicitContentResults =
    operationResult.annotationResults[0].explicitAnnotation;
  console.log('Explicit annotation results:');
  explicitContentResults.frames.forEach(result => {
    if (result.timeOffset === undefined) {
      result.timeOffset = {};
    }
    if (result.timeOffset.seconds === undefined) {
      result.timeOffset.seconds = 0;
    }
    if (result.timeOffset.nanos === undefined) {
      result.timeOffset.nanos = 0;
    }
    console.log(
      `\tTime: ${result.timeOffset.seconds}` +
        `.${(result.timeOffset.nanos / 1e6).toFixed(0)}s`
    );
    console.log(
      `\t\tPornography likelihood: ${likelihoods[result.pornographyLikelihood]}`
    );
  });
  // [END video_analyze_explicit_content]
}

async function analyzeVideoTranscription(gcsUri) {
  // [START video_speech_transcription_gcs]
  // Imports the Google Cloud Video Intelligence library
  const videoIntelligence = require('@google-cloud/video-intelligence');

  // Creates a client
  const client = new videoIntelligence.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of video to analyze, e.g. gs://my-bucket/my-video.mp4';

  async function analyzeVideoTranscript() {
    const videoContext = {
      speechTranscriptionConfig: {
        languageCode: 'en-US',
        enableAutomaticPunctuation: true,
      },
    };

    const request = {
      inputUri: gcsUri,
      features: ['SPEECH_TRANSCRIPTION'],
      videoContext: videoContext,
    };

    const [operation] = await client.annotateVideo(request);
    console.log('Waiting for operation to complete...');
    const [operationResult] = await operation.promise();
    // There is only one annotation_result since only
    // one video is processed.
    const annotationResults = operationResult.annotationResults[0];

    for (const speechTranscription of annotationResults.speechTranscriptions) {
      // The number of alternatives for each transcription is limited by
      // SpeechTranscriptionConfig.max_alternatives.
      // Each alternative is a different possible transcription
      // and has its own confidence score.
      for (const alternative of speechTranscription.alternatives) {
        console.log('Alternative level information:');
        console.log(`Transcript: ${alternative.transcript}`);
        console.log(`Confidence: ${alternative.confidence}`);

        console.log('Word level information:');
        for (const wordInfo of alternative.words) {
          const word = wordInfo.word;
          const start_time =
            wordInfo.startTime.seconds + wordInfo.startTime.nanos * 1e-9;
          const end_time =
            wordInfo.endTime.seconds + wordInfo.endTime.nanos * 1e-9;
          console.log('\t' + start_time + 's - ' + end_time + 's: ' + word);
        }
      }
    }
  }

  analyzeVideoTranscript();
  // [END video_speech_transcription_gcs]
}

async function analyzeTextGCS(gcsUri) {
  //gcsUri - GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4
  //[START video_detect_text_gcs]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence');
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

  const request = {
    inputUri: gcsUri,
    features: ['TEXT_DETECTION'],
  };
  // Detects text in a video
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');
  // Gets annotations for video
  const textAnnotations = results[0].annotationResults[0].textAnnotations;
  textAnnotations.forEach(textAnnotation => {
    console.log(`Text ${textAnnotation.text} occurs at:`);
    textAnnotation.segments.forEach(segment => {
      const time = segment.segment;
      console.log(
        ` Start: ${time.startTimeOffset.seconds || 0}.${(
          time.startTimeOffset.nanos / 1e6
        ).toFixed(0)}s`
      );
      console.log(
        ` End: ${time.endTimeOffset.seconds || 0}.${(
          time.endTimeOffset.nanos / 1e6
        ).toFixed(0)}s`
      );
      console.log(` Confidence: ${segment.confidence}`);
      segment.frames.forEach(frame => {
        const timeOffset = frame.timeOffset;
        console.log(
          `Time offset for the frame: ${timeOffset.seconds || 0}` +
            `.${(timeOffset.nanos / 1e6).toFixed(0)}s`
        );
        console.log('Rotated Bounding Box Vertices:');
        frame.rotatedBoundingBox.vertices.forEach(vertex => {
          console.log(`Vertex.x:${vertex.x}, Vertex.y:${vertex.y}`);
        });
      });
    });
  });
  // [END video_detect_text_gcs]
}

async function analyzeObjectTrackingGCS(gcsUri) {
  //gcsUri - GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4
  //[START video_object_tracking_gcs]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence');

  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of the video to analyze, e.g. gs://my-bucket/my-video.mp4';

  const request = {
    inputUri: gcsUri,
    features: ['OBJECT_TRACKING'],
    //recommended to use us-east1 for the best latency due to different types of processors used in this region and others
    locationId: 'us-east1',
  };
  // Detects objects in a video
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');
  //Gets annotations for video
  const annotations = results[0].annotationResults[0];
  const objects = annotations.objectAnnotations;
  objects.forEach(object => {
    console.log(`Entity description:  ${object.entity.description}`);
    console.log(`Entity id: ${object.entity.entityId}`);
    const time = object.segment;
    console.log(
      `Segment: ${time.startTimeOffset.seconds || 0}` +
        `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s to ${
          time.endTimeOffset.seconds || 0
        }.` +
        `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
    );
    console.log(`Confidence: ${object.confidence}`);
    const frame = object.frames[0];
    const box = frame.normalizedBoundingBox;
    const timeOffset = frame.timeOffset;
    console.log(
      `Time offset for the first frame: ${timeOffset.seconds || 0}` +
        `.${(timeOffset.nanos / 1e6).toFixed(0)}s`
    );
    console.log('Bounding box position:');
    console.log(` left   :${box.left}`);
    console.log(` top    :${box.top}`);
    console.log(` right  :${box.right}`);
    console.log(` bottom :${box.bottom}`);
  });
  // [END video_object_tracking_gcs]
}

async function analyzeText(path) {
  //[START video_detect_text]
  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const Video = require('@google-cloud/video-intelligence');
  const fs = require('fs');
  const util = require('util');
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';

  // Reads a local video file and converts it to base64
  const file = await util.promisify(fs.readFile)(path);
  const inputContent = file.toString('base64');

  const request = {
    inputContent: inputContent,
    features: ['TEXT_DETECTION'],
  };
  // Detects text in a video
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');

  // Gets annotations for video
  const textAnnotations = results[0].annotationResults[0].textAnnotations;
  textAnnotations.forEach(textAnnotation => {
    console.log(`Text ${textAnnotation.text} occurs at:`);
    textAnnotation.segments.forEach(segment => {
      const time = segment.segment;
      if (time.startTimeOffset.seconds === undefined) {
        time.startTimeOffset.seconds = 0;
      }
      if (time.startTimeOffset.nanos === undefined) {
        time.startTimeOffset.nanos = 0;
      }
      if (time.endTimeOffset.seconds === undefined) {
        time.endTimeOffset.seconds = 0;
      }
      if (time.endTimeOffset.nanos === undefined) {
        time.endTimeOffset.nanos = 0;
      }
      console.log(
        `\tStart: ${time.startTimeOffset.seconds || 0}` +
          `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(
        `\tEnd: ${time.endTimeOffset.seconds || 0}.` +
          `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
      );
      console.log(`\tConfidence: ${segment.confidence}`);
      segment.frames.forEach(frame => {
        const timeOffset = frame.timeOffset;
        console.log(
          `Time offset for the frame: ${timeOffset.seconds || 0}` +
            `.${(timeOffset.nanos / 1e6).toFixed(0)}s`
        );
        console.log('Rotated Bounding Box Vertices:');
        frame.rotatedBoundingBox.vertices.forEach(vertex => {
          console.log(`Vertex.x:${vertex.x}, Vertex.y:${vertex.y}`);
        });
      });
    });
  });
  // [END video_detect_text]
}

async function analyzeObjectTracking(path) {
  //[START video_object_tracking]
  // Imports the Google Cloud Video Intelligence library
  const Video = require('@google-cloud/video-intelligence');
  const fs = require('fs');
  const util = require('util');
  // Creates a client
  const video = new Video.VideoIntelligenceServiceClient();
  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';

  // Reads a local video file and converts it to base64
  const file = await util.promisify(fs.readFile)(path);
  const inputContent = file.toString('base64');

  const request = {
    inputContent: inputContent,
    features: ['OBJECT_TRACKING'],
    //recommended to use us-east1 for the best latency due to different types of processors used in this region and others
    locationId: 'us-east1',
  };
  // Detects objects in a video
  const [operation] = await video.annotateVideo(request);
  const results = await operation.promise();
  console.log('Waiting for operation to complete...');
  //Gets annotations for video
  const annotations = results[0].annotationResults[0];
  const objects = annotations.objectAnnotations;
  objects.forEach(object => {
    console.log(`Entity description:  ${object.entity.description}`);
    console.log(`Entity id: ${object.entity.entityId}`);
    const time = object.segment;
    console.log(
      `Segment: ${time.startTimeOffset.seconds || 0}` +
        `.${(time.startTimeOffset.nanos / 1e6).toFixed(0)}s to ${
          time.endTimeOffset.seconds || 0
        }.` +
        `${(time.endTimeOffset.nanos / 1e6).toFixed(0)}s`
    );
    console.log(`Confidence: ${object.confidence}`);
    const frame = object.frames[0];
    const box = frame.normalizedBoundingBox;
    const timeOffset = frame.timeOffset;
    console.log(
      `Time offset for the first frame: ${timeOffset.seconds || 0}` +
        `.${(timeOffset.nanos / 1e6).toFixed(0)}s`
    );
    console.log('Bounding box position:');
    console.log(` left   :${box.left}`);
    console.log(` top    :${box.top}`);
    console.log(` right  :${box.right}`);
    console.log(` bottom :${box.bottom}`);
  });
  // [END video_object_tracking]
}

async function main() {
  require('yargs')
    .demand(1)
    .command(
      'shots <gcsUri>',
      'Analyzes shot angles in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.',
      {},
      opts => analyzeShots(opts.gcsUri)
    )
    .command(
      'labels-gcs <gcsUri>',
      'Labels objects in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.',
      {},
      opts => analyzeLabelsGCS(opts.gcsUri)
    )
    .command(
      'labels-file <filePath>',
      'Labels objects in a video stored locally using the Cloud Video Intelligence API.',
      {},
      opts => analyzeLabelsLocal(opts.filePath)
    )
    .command(
      'safe-search <gcsUri>',
      'Detects explicit content in a video stored in Google Cloud Storage.',
      {},
      opts => analyzeSafeSearch(opts.gcsUri)
    )
    .command(
      'transcription <gcsUri>',
      'Extract the video transcription using the Cloud Video Intelligence API.',
      {},
      opts => analyzeVideoTranscription(opts.gcsUri)
    )
    .command(
      'video-text-gcs <gcsUri>',
      'Analyzes text in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.',
      {},
      opts => analyzeTextGCS(opts.gcsUri)
    )
    .command(
      'track-objects-gcs <gcsUri>',
      'Analyzes objects in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.',
      {},
      opts => analyzeObjectTrackingGCS(opts.gcsUri)
    )
    .command(
      'video-text <path>',
      'Analyzes text in a video stored in a local file using the Cloud Video Intelligence API.',
      {},
      opts => analyzeText(opts.path)
    )
    .command(
      'track-objects <path>',
      'Analyzes objects in a video stored in a local file using the Cloud Video Intelligence API.',
      {},
      opts => analyzeObjectTracking(opts.path)
    )
    .example('node $0 shots gs://cloud-samples-data/video/googlework_short.mp4')
    .example('node $0 labels-gcs gs://cloud-samples-data/video/cat.mp4')
    .example('node $0 labels-file googlework_short.mp4')
    .example(
      'node $0 safe-search gs://cloud-samples-data/video/googlework_short.mp4'
    )
    .example('node $0 transcription gs://cloud-samples-data/video/cat.mp4')
    .example('node $0 video-text ./resources/googlework_short.mp4')
    .example(
      'node $0 video-text-gcs gs://nodejs-docs-samples/video/googlework_short.mp4'
    )
    .example('node $0 track-objects ./resources/googlework_short.mp4')
    .example('node $0 track-objects-gcs gs://nodejs-docs-samples/video/cat.mp4')
    .wrap(120)
    .recommendCommands()
    .epilogue(
      'For more information, see https://cloud.google.com/video-intelligence/docs'
    )
    .help()
    .strict().argv;
}

main().catch(console.error);
