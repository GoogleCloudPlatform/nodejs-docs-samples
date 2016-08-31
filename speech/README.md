<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Speech API Node.js Samples

The [Cloud Speech API][speech_docs] enables easy integration of Google speech
recognition technologies into developer applications.

[speech_docs]: https://cloud.google.com/speech/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Sync Recognize](#sync-recognize)
  * [Streaming Recognition](#streaming-recognition)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Sync Recognize

View the [documentation][recognize_0_docs] or the [source code][recognize_0_code].

__Usage:__ `node recognize <path-to-audio-file>`

```
node recognize resources/audio.raw
```

[recognize_0_docs]: https://cloud.google.com/speech/docs/
[recognize_0_code]: recognize.js

### Streaming Recognition

View the [documentation][recognize_1_docs] or the [source code][recognize_1_code].

__Usage:__ `node recognize_streaming <path-to-audio-file>`

```
node recognize_streaming resources/audio.raw
```

[recognize_1_docs]: https://cloud.google.com/speech/docs/
[recognize_1_code]: recognize_streaming.js
