/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the `License`);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an `AS IS` BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

function analyzeLabelsGCS(gcsUri) {
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
  client
    .annotateVideo(request)
    .then(results => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then(results => {
      // Gets annotations for video
      const annotations = results[0].annotationResults[0];

      const labels = annotations.segmentLabelAnnotations;
      labels.forEach(label => {
        console.log(`Label ${label.entity.description} occurs at:`);
        label.segments.forEach(segment => {
          let time = segment.segment;
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
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END video_analyze_labels_gcs]
}

function analyzeLabelsLocal(path) {
  // [START video_analyze_labels_local]
  // Imports the Google Cloud Video Intelligence library + Node's fs library
  const video = require('@google-cloud/video-intelligence').v1;
  const fs = require('fs');

  // Creates a client
  const client = new video.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const path = 'Local file to analyze, e.g. ./my-file.mp4';

  // Reads a local video file and converts it to base64
  const file = fs.readFileSync(path);
  const inputContent = file.toString('base64');

  // Constructs request
  const request = {
    inputContent: inputContent,
    features: ['LABEL_DETECTION'],
  };

  // Detects labels in a video
  client
    .annotateVideo(request)
    .then(results => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then(results => {
      // Gets annotations for video
      const annotations = results[0].annotationResults[0];

      const labels = annotations.segmentLabelAnnotations;
      labels.forEach(label => {
        console.log(`Label ${label.entity.description} occurs at:`);
        label.segments.forEach(segment => {
          let time = segment.segment;
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
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END video_analyze_labels_local]
}

function analyzeShots(gcsUri) {
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
  client
    .annotateVideo(request)
    .then(results => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then(results => {
      // Gets shot changes
      const shotChanges = results[0].annotationResults[0].shotAnnotations;
      console.log('Shot changes:');

      if (shotChanges.length === 1) {
        console.log(`The entire video is one shot.`);
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
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END video_analyze_shots]
}

function analyzeSafeSearch(gcsUri) {
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
  client
    .annotateVideo(request)
    .then(results => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then(results => {
      // Gets unsafe content
      const explicitContentResults =
        results[0].annotationResults[0].explicitAnnotation;
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
          `\t\tPornography liklihood: ${
            likelihoods[result.pornographyLikelihood]
          }`
        );
      });
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END video_analyze_explicit_content]
}

function analyzeVideoTranscription(gcsUri) {
  // [START video_speech_transcription]
  // Imports the Google Cloud Video Intelligence library
  const videoIntelligence = require('@google-cloud/video-intelligence')
    .v1p1beta1;

  // Creates a client
  const client = new videoIntelligence.VideoIntelligenceServiceClient();

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const gcsUri = 'GCS URI of video to analyze, e.g. gs://my-bucket/my-video.mp4';

  const videoContext = {
    speechTranscriptionConfig: {
      languageCode: 'en-US',
      enableAutomaticPunctuation2: true,
    },
  };

  const request = {
    inputUri: gcsUri,
    features: ['SPEECH_TRANSCRIPTION'],
    videoContext: videoContext,
  };

  client
    .annotateVideo(request)
    .then(results => {
      const operation = results[0];
      console.log('Waiting for operation to complete...');
      return operation.promise();
    })
    .then(results => {
      console.log('Word level information:');
      const alternative =
        results[0].annotationResults[0].speechTranscriptions[0].alternatives[0];
      alternative.words.forEach(wordInfo => {
        let start_time =
          wordInfo.startTime.seconds + wordInfo.startTime.nanos * 1e-9;
        let end_time = wordInfo.endTime.seconds + wordInfo.endTime.nanos * 1e-9;
        console.log(
          '\t' + start_time + 's - ' + end_time + 's: ' + wordInfo.word
        );
      });
      console.log('Transcription: ' + alternative.transcript);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });
  // [END video_speech_transcription]
}

require(`yargs`)
  .demand(1)
  .command(
    `shots <gcsUri>`,
    `Analyzes shot angles in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
    {},
    opts => analyzeShots(opts.gcsUri)
  )
  .command(
    `labels-gcs <gcsUri>`,
    `Labels objects in a video stored in Google Cloud Storage using the Cloud Video Intelligence API.`,
    {},
    opts => analyzeLabelsGCS(opts.gcsUri)
  )
  .command(
    `labels-file <filePath>`,
    `Labels objects in a video stored locally using the Cloud Video Intelligence API.`,
    {},
    opts => analyzeLabelsLocal(opts.filePath)
  )
  .command(
    `safe-search <gcsUri>`,
    `Detects explicit content in a video stored in Google Cloud Storage.`,
    {},
    opts => analyzeSafeSearch(opts.gcsUri)
  )
  .command(
    `transcription <gcsUri>`,
    `Extract the video transcription using the Cloud Video Intelligence API.`,
    {},
    opts => analyzeVideoTranscription(opts.gcsUri)
  )
  .example(`node $0 shots gs://demomaker/sushi.mp4`)
  .example(`node $0 labels-gcs gs://demomaker/tomatoes.mp4`)
  .example(`node $0 labels-file cat.mp4`)
  .example(`node $0 safe-search gs://demomaker/tomatoes.mp4`)
  .example(`node $0 transcription gs://demomaker/tomatoes.mp4`)
  .wrap(120)
  .recommendCommands()
  .epilogue(
    `For more information, see https://cloud.google.com/video-intelligence/docs`
  )
  .help()
  .strict().argv;
