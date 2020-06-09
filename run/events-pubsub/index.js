// Copyright 2020 Google LLC. All rights reserved.
// Use of this source code is governed by the Apache 2.0
// license that can be found in the LICENSE file.

// [START run_events_pubsub_server]
const app = require('./app.js');
const PORT = process.env.PORT || 8080;

app.listen(PORT, () =>
  console.log(`nodejs-run-events-pubsub listening on port ${PORT}`)
);
// [END run_events_pubsub_server]
