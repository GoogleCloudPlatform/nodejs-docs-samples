/*
Copyright 2020 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
const express = require('express');
const app = express();
const sleep = require('sleep');

const prometheus = require('prom-client');
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({register});

// define golden signal metrics
// total requests - counter
const nodeRequestsCounter = new prometheus.Counter({
  name: 'node_requests',
  help: 'total requests',
});

// failed requests - counter
const nodeFailedRequestsCounter = new prometheus.Counter({
  name: 'node_failed_requests',
  help: 'failed requests',
});

// latency - histogram
const nodeLatenciesHistogram = new prometheus.Histogram({
  name: 'node_request_latency',
  help: 'request latency by path',
  labelNames: ['route'],
  buckets: [100, 400],
});

app.get('/', (req, res) => {
  // start latency timer
  const requestReceived = new Date().getTime();
  console.log('request made');
  // increment total requests counter
  nodeRequestsCounter.inc();
  // return an error 10% of the time
  if (Math.floor(Math.random() * 100) > 90) {
    // increment error counter
    nodeFailedRequestsCounter.inc();
    // return error code
    res.send('error!', 500);
  } else {
    // delay for a bit
    sleep.msleep(Math.floor(Math.random() * 1000));
    // record response latency
    const responseLatency = new Date().getTime() - requestReceived;
    nodeLatenciesHistogram.labels(req.route.path).observe(responseLatency);
    res.send('success in ' + responseLatency + ' ms');
  }
});

app.get('/metrics', (req, res) => {
  res.set('Content-Type', prometheus.register.contentType);
  res.end(prometheus.register.metrics());
});

module.exports = app;
app.listen(8080, () => console.log('Example app listening on port 8080!'));
