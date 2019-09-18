// Copyright 2019 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START run_broken_service]
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('hello-broken: received request.');

  // [START run_broken_service_problem]
  const {TARGET} = process.env;
  if (!TARGET) {
    // Plain error logs do not appear in Stackdriver Error Reporting.
    console.error('Environment validation failed.');
    console.error(new Error('Missing required server parameter'));
    res.status(500).send('Internal Server Error');
    return;
  }
  // [END run_broken_service_problem]
  res.send(`Hello ${TARGET}!`);
});
// [END run_broken_service]

app.get('/improved', (req, res) => {
  console.log('hello-broken: received request.');

  // [START run_broken_service_upgrade]
  const TARGET = process.env.TARGET || 'World';
  if (!process.env.TARGET) {
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `TARGET not set, default to '${TARGET}'`,
      })
    );
  }
  // [END run_broken_service_upgrade]
  res.send(`Hello ${TARGET}!`);
});

// [START run_broken_service]
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`hello-broken: listening on port ${port}`);
});
// [END run_broken_service]
