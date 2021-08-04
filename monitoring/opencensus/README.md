<img src="https://avatars2.githubusercontent.com/u/38480854?v=3&s=96" alt="OpenCensus logo" title="OpenCensus" align="right" height="96" width="96"/>

# OpenCensus Samples for Node.js - SLIs
OpenCensus is a toolkit for collecting application performance and behavior data. It currently includes 3 apis: stats, tracing and tags.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Stats API](#stats-api)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

        npm install


[prereq]: ../../README.md#prerequisites
[run]: ../../README.md#how-to-run-a-sample

## Samples

### SLI metrics

View the [documentation][stats_0_docs] or the [source code][stats_0_code].

Start the server locally by running

    node app.js

and send requests to it at

    http://localhost:8080

__Usage:__ `node app.js`

[stats_0_docs]: https://opencensus.io/stats/
[stats_0_code]: app.js
