<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Stackdriver Monitoring Node.js Samples

[Stackdriver Monitoring][monitoring_docs] collects metrics, events, and metadata
from Google Cloud Platform, Amazon Web Services (AWS), hosted uptime probes,
application instrumentation, and a variety of common application components
including Cassandra, Nginx, Apache Web Server, Elasticsearch and many others.

[monitoring_docs]: https://cloud.google.com/monitoring/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Listing resources](#listing-resources)
  * [Custom metrics](#custom-metrics)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Listing resources

View the [documentation][list_0_docs] or the [source code][list_0_code].

`list_resources.js` is a command-line program to demonstrate connecting to the
Google Monitoring API to retrieve API data.

__Usage:__ `node list_resources <YOUR_PROJECT_ID>`

```
node list_resources my-cool-project
```

[list_0_docs]: https://cloud.google.com/monitoring/demos/#hello-world
[list_0_code]: list_resources.js

### Custom metrics

View the [documentation][metrics_1_docs] or the [source code][metrics_1_code].

`create_custom_metric.js` demonstrates how to create a custom metric, write a
timeseries value to it, and read it back.

__Usage:__ `node create_custom_metric <YOUR_PROJECT_ID>`

```
node create_custom_metric my-cool-project
```

[metrics_1_docs]: https://cloud.google.com/monitoring/demos/#custom_metrics
[metrics_1_code]: create_custom_metric.js
