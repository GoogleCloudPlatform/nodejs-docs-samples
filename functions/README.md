<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Functions Node.js Samples

[Cloud Run functions](https://cloud.google.com/functions/docs/concepts/overview) is a lightweight, event-based, asynchronous compute solution that allows you to create small, single-purpose functions that respond to Cloud events without the need to manage a server or a runtime environment.

There are two versions of Cloud Run functions:

* **Cloud Run functions**, formerly known as Cloud Functions (2nd gen), which deploys your function as services on Cloud Run, allowing you to trigger them using Eventarc and Pub/Sub. Cloud Run functions are created using `gcloud functions` or `gcloud run`. Samples for Cloud Run functions can be found in the [`functions/v2`](v2/) folder.
* **Cloud Run functions (1st gen)**, formerly known as Cloud Functions (1st gen), the original version of functions with limited event triggers and configurability. Cloud Run functions (1st gen) are created using `gcloud functions --no-gen2`. Samples for Cloud Run functions (1st generation) can be found in the current `functions/` folder.

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

* [Hello World](helloworld/)
* [Cloud Pub/Sub](v2/helloPubSub)
* [HTTP](http/)
* [Logging & Monitoring](log/)
* [OCR (Optical Character Recognition)](ocr/)
* [Slack](slack/)
