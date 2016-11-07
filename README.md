<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Platform Node.js Samples [![Slack][slack_badge]][slack_link] [![Build][build_badge]][build_link] [![Coverage][cov_badge]][cov_link]

Node.js samples for [Google Cloud Platform products][cloud].

See [cloud.google.com/nodejs][cloud_nodejs] to get up and running with Node.js
on Google Cloud Platform.

[slack_badge]: https://img.shields.io/badge/slack-nodejs%20on%20gcp-E01563.svg
[slack_link]: https://gcp-slack.appspot.com/
[build_badge]: https://img.shields.io/circleci/project/github/GoogleCloudPlatform/nodejs-docs-samples/master.svg?style=flat
[build_link]: https://circleci.com/gh/GoogleCloudPlatform/nodejs-docs-samples
[cov_badge]: https://img.shields.io/codecov/c/github/GoogleCloudPlatform/nodejs-docs-samples/master.svg?style=flat
[cov_link]: https://codecov.io/github/GoogleCloudPlatform/nodejs-docs-samples?branch=master
[cloud]: https://cloud.google.com/
[cloud_nodejs]: https://cloud.google.com/nodejs/

## Table of Contents

* [Setup](#setup)
  * [Prerequisites](#prerequisites)
  * [How to run a sample](#how-to-run-a-sample)
  * [How to run the tests](#how-to-run-the-tests)
* [Client libraries](#client-libraries)
  * [Google Cloud Node.js client library](#google-cloud-nodejs-client-library)
  * [Google API Node.js client library](#google-api-nodejs-client-library)
* [Code samples](#code-samples)
  * [**Compute**](#compute)
    * [Google App Engine (Flexible Environment)](#google-app-engine-flexible-environment)
    * [Google Compute Engine](#google-compute-engine)
    * [Google Container Engine](#google-container-engine)
    * [Google Cloud Functions (Alpha)](#google-cloud-functions-alpha)
  * [**Storage and Databases**](#storage-and-databases)
    * [Google Cloud Datastore](#google-cloud-datastore)
    * [Google Cloud Storage](#google-cloud-storage)
  * [**Big Data**](#big-data)
    * [Google BigQuery](#google-bigquery)
    * [Google Cloud Pub/Sub](#google-cloud-pubsub)
  * [**Machine Learning**](#machine-learning)
    * [Google Cloud Natural Language API](#google-cloud-natural-language-api)
    * [Google Cloud Prediction API](#google-cloud-prediction-api)
    * [Google Cloud Speech API (Beta)](#google-cloud-speech-api-beta)
    * [Google Translate API](#google-translate-api)
    * [Google Cloud Vision API](#google-cloud-vision-api)
  * [**Management Tools**](#management-tools)
    * [Stackdriver Debugger](#stackdriver-debugger)
    * [Stackdriver Logging](#stackdriver-logging)
    * [Stackdriver Monitoring](#stackdriver-monitoring)
    * [Stackdriver Trace](#stackdriver-trace)
  * [**Networking**](#management-tools)
    * [Google Cloud DNS](#google-cloud-dns)
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

        gcloud beta auth application-default login

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

### How to run the tests

1. Read the [Contributing Guide][contrib].
1. In a terminal, start Redis:

        redis-server

1. In another terminal, start `memcached`:

        memcached

1. In another terminal, run the unit tests from the root of the project:

        npm test

    or with coverage:

        npm run coverage

1. Then run the system tests from the root of the project:

        npm run system-test

    or with coverage:

        npm run system-cover

1. Or run all the tests at once with coverage:

        npm run all-cover

## Client libraries

### <img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=36" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="left" height="36" width="36" style="margin-top: 9px;"/>Google Cloud Node.js client library

The recommended, idiomatic client for Google Cloud Platform services.

* [Documentation](https://googlecloudplatform.github.io/gcloud-node/)
* [Source code](https://github.com/GoogleCloudPlatform/gcloud-node)

### <img src="https://avatars0.githubusercontent.com/u/1342004?v=3&s=36" alt="Google logo" title="Google" align="left" height="36" width="36" style="margin-top: 9px;"/>Google API Node.js client library

An older Node.js client library for making REST requests to Google APIs.

* [Documentation](http://google.github.io/google-api-nodejs-client/)
* [Source code](https://github.com/google/google-api-nodejs-client)

## Code samples

### Compute

#### Google App Engine (flexible environment)

The [App Engine flexible environment][flex_docs] is based on Google Compute
Engine and automatically scales your app up and down while balancing the load.

View the [App Engine flexible environment Node.js samples][flex_samples].

[flex_docs]: https://cloud.google.com/appengine/docs/flexible/nodejs/
[flex_samples]: appengine

#### Google Compute Engine

[Compute Engine][compute_docs] lets you create and run virtual machines on
Google infrastructure.

View the [Compute Engine Node.js samples][compute_samples].

[compute_docs]: https://cloud.google.com/compute/docs/
[compute_samples]: computeengine

#### Google Container Engine

[Container Engine][container_docs]: Run Docker containers on Google Cloud
Platform, powered by Kubernetes.

View the [Container Engine Node.js samples][container_samples].

[container_docs]: https://cloud.google.com/container-engine/docs/
[container_samples]: containerengine

#### Google Cloud Functions (Alpha)

[Sign up for the Alpha][functions_signup].

[Cloud Functions][functions_docs] is a lightweight, event-based, asynchronous
compute solution that allows you to create small, single-purpose functions that
respond to Cloud events without the need to manage a server or a runtime
environment.

View the [Cloud Functions Node.js samples][functions_samples].

[functions_signup]: https://docs.google.com/a/google.com/forms/d/1WQNWPK3xdLnw4oXPT_AIVR9-gd6DLo5ZIucyxzSQ5fQ/viewform
[functions_docs]: https://cloud.google.com/functions/docs/
[functions_samples]: functions

### Storage and Databases

#### Google Cloud Datastore

[Cloud Datastore][datastore_docs] is a NoSQL document database built for
automatic scaling, high performance, and ease of application development.

View the [Cloud Datastore Node.js samples][datastore_samples].

[datastore_docs]: https://cloud.google.com/datastore/docs/
[datastore_samples]: datastore

#### Google Cloud Storage

[Cloud Storage][storage_docs] allows world-wide storage and retrieval of any
amount of data at any time.

View the [Cloud Storage Node.js samples][storage_samples].

[storage_docs]: https://cloud.google.com/storage/docs/
[storage_samples]: storage

### Big Data

#### Google BigQuery

[BigQuery][bigquery_docs] is Google's fully managed, petabyte scale, low cost
analytics data warehouse.

View the [BigQuery Node.js samples][bigquery_samples].

[bigquery_docs]: https://cloud.google.com/bigquery/docs/
[bigquery_samples]: bigquery

#### Google Cloud Pub/Sub

[Cloud Pub/Sub][pubsub_docs] is a fully-managed real-time messaging service that
allows you to send and receive messages between independent applications.

View the [Cloud Pub/Sub Node.js samples][pubsub_samples].

[pubsub_docs]: https://cloud.google.com/pubsub/docs/
[pubsub_samples]: pubsub

### Machine Learning

#### Google Cloud Natural Language API

[Cloud Natural Language API][language_docs] provides natural language
understanding technologies to developers, including sentiment analysis, entity
recognition, and syntax analysis. This API is part of the larger Cloud Machine
Learning API.

View the [Cloud Natural Language API Node.js samples][language_samples].

[language_docs]: https://cloud.google.com/natural-language/docs/
[language_samples]: language

#### Google Cloud Prediction API

The [Cloud Prediction API][prediction_docs] provides a RESTful API to build
Machine Learning models.

View the [Cloud Prediction API Node.js samples][prediction_samples].

[prediction_docs]: https://cloud.google.com/prediction/docs/
[prediction_samples]: prediction

#### Google Cloud Speech API (Beta)

The [Cloud Speech API][speech_docs] enables easy integration of Google speech
recognition technologies into developer applications.

View the [Cloud Speech API Node.js samples][speech_samples].

[speech_docs]: https://cloud.google.com/speech/
[speech_samples]: speech

#### Google Translate API

With the [Google Translate API][translate_docs], you can dynamically translate
text between thousands of language pairs.

View the [Translate API Node.js samples][translate_samples].

[translate_docs]: https://cloud.google.com/translate/docs/
[translate_samples]: translate

#### Google Cloud Vision API

The [Cloud Vision API][vision_docs] allows developers to easily integrate vision
detection features within applications, including image labeling, face and
landmark detection, optical character recognition (OCR), and tagging of explicit
content.

View the [Cloud Vision API Node.js samples][vision_samples].

[vision_docs]: https://cloud.google.com/vision/docs/
[vision_samples]: vision

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

View the [Stackdriver Logging Node.js samples][logging_samples].

[logging_docs]: https://cloud.google.com/logging/docs/
[logging_samples]: logging

#### Stackdriver Monitoring

[Stackdriver Monitoring][monitoring_docs] collects metrics, events, and metadata
from Google Cloud Platform, Amazon Web Services (AWS), hosted uptime probes,
application instrumentation, and a variety of common application components
including Cassandra, Nginx, Apache Web Server, Elasticsearch and many others.

View the [Stackdriver Monitoring Node.js samples][monitoring_samples].

[monitoring_docs]: https://cloud.google.com/monitoring/docs/
[monitoring_samples]: monitoring

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

View the [Google Cloud DNS Node.js sample][dns_sample].

[dns_docs]: https://cloud.google.com/dns/docs/
[dns_sample]: dns

## Other sample applications

### Bookshelf tutorial app

The [Bookshelf app][bookshelf_docs] is a sample web app written in Node.js that
shows you how to use a variety of Google Cloud Platform features.

View the [tutorial][bookshelf_docs] or the [source code][bookshelf_code].

[bookshelf_docs]: https://cloud.google.com/nodejs/getting-started/tutorial-app
[bookshelf_code]: https://github.com/GoogleCloudPlatform/nodejs-getting-started

### LabelCat

[LabelCat][labelcat_docs] is a NodeJS app that uses the Google Cloud Prediction
API to automatically label GitHub Issues as they are created.

View the [tutorial][labelcat_docs] or the [source code][labelcat_code].

[labelcat_docs]: https://cloud.google.com/nodejs/resources/examples/labelcat
[labelcat_code]: https://github.com/GoogleCloudPlatform/LabelCat

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
