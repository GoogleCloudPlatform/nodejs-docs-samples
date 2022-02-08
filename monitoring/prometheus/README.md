<img src="https://linuxfoundation.org/wp-content/uploads/prometheus.svg" alt="Prometheus logo" title="Prometheus" align="right" height="96" width="96"/>

# Prometheus Samples for Node.js - SLIs

Prometheus is an open-source systems monitoring and alerting toolkit originally built at SoundCloud. Since its inception in 2012, many companies and organizations have adopted Prometheus, and the project has a very active developer and user community. It is now a standalone open source project and maintained independently of any company. To emphasize this, and to clarify the project's governance structure, Prometheus joined the Cloud Native Computing Foundation in 2016 as the second hosted project, after Kubernetes.

## Table of Contents

- [Setup](#setup)
- [Samples](#samples)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

        npm install

[prereq]: ../../README.md#prerequisites
[run]: ../../README.md#how-to-run-a-sample

## Samples

### SLI metrics

View the [documentation][prometheus_0_docs] or the [source code][prometheus_0_code].

Start the server locally by running

 node app.js

and send requests to it at

    http://localhost:8080

Then, see the metrics at

    http://localhost:8080/metrics

**Usage:** `node app.js`

[prometheus_0_docs]: https://prometheus.io/docs/
[prometheus_0_code]: app.js
