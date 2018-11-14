<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Platform Node.js Samples [![Slack][slack_badge]][slack_link] [![Coverage][cov_badge]][cov_link]

Node.js samples for [Google Cloud Platform products][cloud].

See [cloud.google.com/nodejs][cloud_nodejs] to get up and running with Node.js
on Google Cloud Platform.

[slack_badge]: https://img.shields.io/badge/slack-nodejs%20on%20gcp-E01563.svg
[slack_link]: https://gcp-slack.appspot.com/
[cov_badge]: https://img.shields.io/codecov/c/github/GoogleCloudPlatform/nodejs-docs-samples/master.svg?style=flat
[cov_link]: https://codecov.io/github/GoogleCloudPlatform/nodejs-docs-samples?branch=master
[cloud]: https://cloud.google.com/
[cloud_nodejs]: https://cloud.google.com/nodejs/

## Table of Contents

* [Setup](#setup)
  * [Prerequisites](#prerequisites)
  * [How to run a sample](#how-to-run-a-sample)
* [Client libraries](#client-libraries)
  * [Google Cloud Node.js client library](#google-cloud-nodejs-client-library)
  * [Google API Node.js client library](#google-api-nodejs-client-library)
* [Code samples](#code-samples)
  * [**Compute**](#compute)
    * [Google App Engine](#google-app-engine)
    * [Google Compute Engine](#google-compute-engine)
    * [Google Container Engine](#google-container-engine)
    * [Google Cloud Functions (Beta)](#google-cloud-functions-beta)
  * [**Storage and Databases**](#storage-and-databases)
    * [Cloud Spanner](#cloud-spanner)
    * [Google Cloud Datastore](#google-cloud-datastore)
    * [Google Cloud Storage](#google-cloud-storage)
  * [**Big Data**](#big-data)
    * [Google BigQuery](#google-bigquery)
    * [Google Cloud Pub/Sub](#google-cloud-pubsub)
  * [**Machine Learning**](#machine-learning)
    * [Google Cloud Natural Language API](#google-cloud-natural-language-api)
    * [Google Cloud Speech API (Beta)](#google-cloud-speech-api-beta)
    * [Google Translate API](#google-translate-api)
    * [Google Video Intelligence API](#google-video-intelligence-api)
    * [Google Cloud Vision API](#google-cloud-vision-api)
  * [**Management Tools**](#management-tools)
    * [Stackdriver Debugger](#stackdriver-debugger)
    * [Stackdriver Logging](#stackdriver-logging)
    * [Stackdriver Monitoring](#stackdriver-monitoring)
    * [Stackdriver Trace](#stackdriver-trace)
  * [**Networking**](#networking)
    * [Google Cloud DNS](#google-cloud-dns)
  * [**Identity and Security**](#identity-and-security)
    * [Google Cloud Data Loss Prevention (DLP)](#google-cloud-data-loss-prevention-dlp)
    * [Google Cloud Key Management Service](#google-cloud-key-management-service)
* [Other sample applications](#other-sample-applications)
  * [Bookshelf tutorial app](#bookshelf-tutorial-app)
  * [LabelCat](#labelcat)
  * [Node.js Codelab](#nodejs-codelab)
* [Contributing](#contributing)
* [License](#license)

## Setup

### Prerequisites

1. Install [Node.js v4.5.0 or greater][node]
1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

1. Change directory in to the project:

        cd nodejs-docs-samples

1. Set the `GCLOUD_PROJECT` environment variable:

    Linux:

        export GCLOUD_PROJECT=your-project-id

    Windows:

        set GCLOUD_PROJECT=your-project-id

    Windows (PowerShell):

        $env:GCLOUD_PROJECT="your-project-id"

1. Obtain authentication credentials.

    Create local credentials by running the following command and following the
    oauth2 flow (read more about the command [here][auth_command]):

        gcloud auth application-default login

    In non-Google Cloud environments, GCE instances created without the
    correct scopes, or local workstations where the
    `gcloud beta auth application-default login` command fails, use a service
    account by doing the following:

    * Go to API Manager -> Credentials
    * Click "New Credentials", and create a service account or [click here](https://console.cloud.google.com/project/_/apiui/credential/serviceaccount)
    * Download the JSON for this service account, and set the `GOOGLE_APPLICATION_CREDENTIALS`
    environment variable to point to the file containing the JSON credentials.

    Set the `GOOGLE_APPLICATION_CREDENTIALS` environment variable:

    Linux:

        export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service_account_file.json

    Windows:

        set GOOGLE_APPLICATION_CREDENTIALS=/path/to/service_account_file.json

    Windows (PowerShell):

        $env:GOOGLE_APPLICATION_CREDENTIALS="/path/to/service_account_file.json"

    __Note for code running on GCE, GAE, or other environments:__

    On Google App Engine, the credentials should be found automatically.

    On Google Compute Engine, the credentials should be found automatically, but require that
    you create the instance with the correct scopes.

        gcloud compute instances create --scopes="https://www.googleapis.com/auth/cloud-platform,https://www.googleapis.com/auth/compute,https://www.googleapis.com/auth/compute.readonly" test-instance

    If you did not create the instance with the right scopes, you can still
    upload a JSON service account and set `GOOGLE_APPLICATION_CREDENTIALS`
    as described.

    Read more about [Google Cloud Platform Authentication][gcp_auth].


[node]: https://nodejs.org/
[auth_command]: https://cloud.google.com/sdk/gcloud/reference/beta/auth/application-default/login
[gcp_auth]: https://cloud.google.com/docs/authentication#projects_and_resources

### How to run a sample

1. Change directory to one of the sample folders, e.g. `bigquery`:

        cd bigquery/

1. Install the sample's dependencies (see the sample's README for details):

        npm install

1. Run the sample:

        node sample_file.js [args]...

## Client libraries

### <img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=36" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="left" height="36" width="36" style="margin-top: 9px;"/>Google Cloud Node.js client library

The recommended, idiomatic client for Google Cloud Platform services.

* [Documentation](https://googlecloudplatform.github.io/gcloud-node/)
* [Source code](https://github.com/GoogleCloudPlatform/gcloud-node)

### <img src="https://avatars0.githubusercontent.com/u/1342004?v=3&s=36" alt="Google logo" title="Google" align="left" height="36" width="36" style="margin-top: 9px;"/>Google API Node.js client library

An older Node.js client library for making REST requests to Google APIs. Use
this for Google Cloud APIs that are not yet supported by the Google Cloud
Node.js client library.

* [Documentation](http://google.github.io/google-api-nodejs-client/)
* [Source code](https://github.com/google/google-api-nodejs-client)

## Code samples

### Compute

#### Google App Engine

[Google App Engine][gae_docs] is a fully managed serverless application
platform.

View the [App Engine Node.js samples][gae_samples].

[gae_docs]: https://cloud.google.com/appengine/docs/nodejs/
[gae_samples]: appengine

#### Google Compute Engine

[Compute Engine][compute_docs] lets you create and run virtual machines on
Google infrastructure.

View the [Compute Engine Node.js samples][compute_samples].

[compute_docs]: https://cloud.google.com/compute/docs/
[compute_samples]: https://github.com/googleapis/nodejs-compute/tree/master/samples

#### Google Container Engine

[Container Engine][container_docs]: Run Docker containers on Google Cloud
Platform, powered by Kubernetes.

View the [Container Engine Node.js samples][container_samples].

[container_docs]: https://cloud.google.com/container-engine/docs/
[container_samples]: containerengine

#### Google Cloud Functions (Beta)

[Cloud Functions][functions_docs] is a lightweight, event-based, asynchronous
compute solution that allows you to create small, single-purpose functions that
respond to Cloud events without the need to manage a server or a runtime
environment.

View the [Cloud Functions Node.js samples][functions_samples].

[functions_signup]: https://docs.google.com/a/google.com/forms/d/1WQNWPK3xdLnw4oXPT_AIVR9-gd6DLo5ZIucyxzSQ5fQ/viewform
[functions_docs]: https://cloud.google.com/functions/docs/
[functions_samples]: functions

### Storage and Databases

#### Cloud Spanner

[Cloud Spanner][spanner_docs] is a managed, mission-critical, globally
consistent and scalable relational database service.

View the [Cloud Spanner Node.js samples][spanner_samples].

[spanner_docs]: https://cloud.google.com/spanner/docs/
[spanner_samples]: https://github.com/googleapis/nodejs-spanner/tree/master/samples

#### Google Cloud Datastore

[Cloud Datastore][datastore_docs] is a NoSQL document database built for
automatic scaling, high performance, and ease of application development.

View the [Cloud Datastore Node.js samples][datastore_samples].

[datastore_docs]: https://cloud.google.com/datastore/docs/
[datastore_samples]: https://github.com/googleapis/nodejs-datastore/tree/master/samples

#### Google Cloud Storage

[Cloud Storage][storage_docs] allows world-wide storage and retrieval of any
amount of data at any time.

View the [Cloud Storage JSON API Node.js Client samples][storage_samples].

[storage_docs]: https://cloud.google.com/storage/docs/
[storage_samples]: https://github.com/googleapis/nodejs-storage/tree/master/samples

#### Google Cloud Storage Transfer API

The Google Cloud Storage Transfer API allows you to quickly import online data
into Google Cloud Storage.

View the [Cloud Storage Transfer API Node.js samples][transfer_samples].

[transfer_docs]: https://cloud.google.com/storage/transfer/
[transfer_samples]: storage-transfer

### Big Data

#### Google BigQuery

[BigQuery][bigquery_docs] is Google's fully managed, petabyte scale, low cost
analytics data warehouse.

View the [BigQuery Node.js samples][bigquery_samples].

[bigquery_docs]: https://cloud.google.com/bigquery/docs/
[bigquery_samples]: https://github.com/googleapis/nodejs-bigquery/tree/master/samples

#### Google Cloud Pub/Sub

[Cloud Pub/Sub][pubsub_docs] is a fully-managed real-time messaging service that
allows you to send and receive messages between independent applications.

View the [Cloud Pub/Sub Node.js samples][pubsub_samples].

[pubsub_docs]: https://cloud.google.com/pubsub/docs/
[pubsub_samples]: https://github.com/googleapis/nodejs-pubsub/tree/master/samples

### Machine Learning

#### Google Cloud Natural Language API

[Cloud Natural Language API][language_docs] provides natural language
understanding technologies to developers, including sentiment analysis, entity
recognition, and syntax analysis. This API is part of the larger Cloud Machine
Learning API.

View the [Cloud Natural Language API Node.js Client samples][language_samples].

[language_docs]: https://cloud.google.com/natural-language/docs/
[language_samples]: language

#### Google Cloud Speech API (Beta)

The [Cloud Speech API][speech_docs] enables easy integration of Google speech
recognition technologies into developer applications.

View the [Cloud Speech API Node.js samples][speech_samples].

[speech_docs]: https://cloud.google.com/speech/
[speech_samples]: https://github.com/googleapis/nodejs-speech/tree/master/samples

#### Google Translate API

With the [Google Translate API][translate_docs], you can dynamically translate
text between thousands of language pairs.

View the [Translate API Node.js samples][translate_samples].

[translate_docs]: https://cloud.google.com/translate/docs/
[translate_samples]: https://github.com/googleapis/nodejs-translate/tree/master/samples

#### Google Cloud Video Intelligence API

The [Cloud Video Intelligence API][video_intelligence_docs] allows developers to
use Google video analysis technology as part of their applications.

View the [Cloud Video Intelligence API Node.js samples][video_intelligence_samples].

[video_intelligence_docs]: https://cloud.google.com/video-intelligence/docs/
[video_intelligence_samples]: https://github.com/googleapis/nodejs-video-intelligence/tree/master/samples

#### Google Cloud Vision API

The [Cloud Vision API][vision_docs] allows developers to easily integrate vision
detection features within applications, including image labeling, face and
landmark detection, optical character recognition (OCR), and tagging of explicit
content.

View the [Cloud Vision API Node.js samples][vision_samples].

[vision_docs]: https://cloud.google.com/vision/docs/
[vision_samples]: https://github.com/googleapis/nodejs-vision/tree/master/samples

### Management Tools

#### Stackdriver Debugger

[Stackdriver Debugger][debugger_docs] makes it easier to view the application
state without adding logging statements.

View the [Stackdriver Debugger Node.js sample][debugger_sample].

[debugger_docs]: https://cloud.google.com/debugger/docs/
[debugger_sample]: debugger

#### Stackdriver Logging

[Stackdriver Logging][logging_docs] allows you to store, search, analyze,
monitor, and alert on log data and events from Google Cloud Platform and Amazon
Web Services.

View the [Stackdriver Logging API Node.js Client samples][logging_samples].

[logging_docs]: https://cloud.google.com/logging/docs/
[logging_samples]: https://github.com/googleapis/nodejs-logging/tree/master/samples

#### Stackdriver Monitoring

[Stackdriver Monitoring][monitoring_docs] collects metrics, events, and metadata
from Google Cloud Platform, Amazon Web Services (AWS), hosted uptime probes,
application instrumentation, and a variety of common application components
including Cassandra, Nginx, Apache Web Server, Elasticsearch and many others.

View the [Stackdriver Monitoring API Node.js Client samples][monitoring_samples].

[monitoring_docs]: https://cloud.google.com/monitoring/docs/
[monitoring_samples]: https://github.com/googleapis/nodejs-monitoring/tree/master/samples

#### Stackdriver Trace

[Stackdriver Trace][trace_docs] is a distributed tracing system for Google Cloud
Platform that collects latency data from App Engine applications and displays it
in near real time in the Google Cloud Platform Console.

View the [Stackdriver Trace Node.js sample][trace_sample].

[trace_docs]: https://cloud.google.com/trace/docs/
[trace_sample]: trace

### Networking

#### Google Cloud DNS

Publish your domain names using Google's infrastructure for production-quality,
high-volume DNS services. Google's global network of anycast name servers
provide reliable, low-latency authoritative name lookups for your domains from
anywhere in the world. Read more about [Google Cloud DNS][dns_docs].

[dns_docs]: https://cloud.google.com/dns/docs

View the [Google Cloud DNS API Node.js Client samples][dns_samples].

[dns_docs]: https://cloud.google.com/dns/docs/
[dns_samples]: https://github.com/googleapis/nodejs-dns/tree/master/samples

### Identity and Security

#### Google Cloud Key Management Service

The [Data Loss Prevention API][dlp_docs] provides programmatic access to a
powerful detection engine for personally identifiable information and other
privacy-sensitive data in unstructured data streams.

View the [Google Cloud Data Loss Prevention API Node.js samples][dlp_sample].

[dlp_docs]: https://cloud.google.com/dlp/docs/
[dlp_sample]: https://github.com/googleapis/nodejs-dlp/tree/master/samples

#### Google Cloud Key Management Service

The [Cloud KMS API][kms_docs] is a service that allows you to keep encryption
keys centrally in the cloud, for direct use by cloud services.

View the [Google Cloud Key Management Service Node.js samples][kms_sample].

[kms_docs]: https://cloud.google.com/kms/docs/
[kms_sample]: dns

## Other sample applications

### Bookshelf tutorial app

The [Bookshelf app][bookshelf_docs] is a sample web app written in Node.js that
shows you how to use a variety of Google Cloud Platform features.

View the [tutorial][bookshelf_docs] or the [source code][bookshelf_code].

[bookshelf_docs]: https://cloud.google.com/nodejs/getting-started/tutorial-app
[bookshelf_code]: https://github.com/GoogleCloudPlatform/nodejs-getting-started

### Node.js Codelab

In the [Node.js Web App Google Cloud Platform][codelab_docs] codelab, you learn
how to integrate Google Cloud Platform services into a Node.js web application
to store data, upload images, and authenticate users.

View the [tutorial][codelab_docs] or the [source code][codelab_code].

[codelab_docs]: https://gcplab.me/codelabs/cloud-nodejs/index.html
[codelab_code]: https://github.com/googlecodelabs/cloud-nodejs

## Contributing

Contributions welcome! See the [Contributing Guide][contrib].

## License

Apache Version 2.0

See [LICENSE](LICENSE)

[contrib]: CONTRIBUTING.md
