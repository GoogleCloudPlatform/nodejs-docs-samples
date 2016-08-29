<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Vision API Node.js Samples

The [Cloud Vision API][vision_docs] allows developers to easily integrate vision
detection features within applications, including image labeling, face and
landmark detection, optical character recognition (OCR), and tagging of explicit
content.

[vision_docs]: https://cloud.google.com/vision/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Face Detection](#face-detection)
  * [Label Detection](#label-detection)
  * [Landmark Detection](#landmark-detection)
  * [Text Detection](#text-detection)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Face Detection

View the [documentation][face_0_docs] or the [source code][face_0_code].

This sample uses [node-canvas](https://github.com/Automattic/node-canvas)
to draw an output image. node-canvas depends on Cairo, which may require separate
installation. See the node-canvas [installation section][canvas-install] for
details.

[canvas-install]: https://github.com/Automattic/node-canvas#installation

__Usage:__ `node faceDetection <path-to-image-file>`

```
node faceDetection "./resources/face.png"
```

[face_0_docs]: https://cloud.google.com/vision/docs/face-tutorial
[face_0_code]: faceDetection.js

### Label Detection

View the [documentation][label_1_docs] or the [source code][label_1_code].

__Usage:__ `node labelDetection <path-to-image-file>`

```
node labelDetection "./resources/wakeupcat.jpg"
```

[label_1_docs]: https://cloud.google.com/vision/docs/label-tutorial
[label_1_code]: labelDetection.js

### Landmark Detection

View the [documentation][landmark_2_docs] or the [source code][landmark_2_code].

__Usage:__ `node landmarkDetection <image-uri>`

```
node landmarkDetection "https://cloud-samples-tests.storage.googleapis.com/vision/water.jpg"
```

[landmark_2_docs]: https://cloud.google.com/vision/docs/landmark-tutorial
[landmark_2_code]: landmarkDetection.js

### Text Detection

View the [documentation][text_3_docs] or the [source code][text_3_code].

__Usage:__ `node textDetection --help`

```
Usage: node textDetection <command> <arg> ...

	Commands: analyze, lookup
```

[text_3_docs]: https://cloud.google.com/vision/docs
[text_3_code]: textDetection.js
