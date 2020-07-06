// Copyright 2020 Google, LLC.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START run_events_gcs_handler]
const express = require('express');
const app = express();

app.use(express.json());
app.post('/', (req, res) => {
  if (!req.header('ce-subject')) {
    return res.status(400).send('Bad Request: missing required header: ce-subject');
  }

  console.log(`GCS CloudEvent type: ${req.header('ce-subject')}`);
  return res.status(200).send(`GCS CloudEvent type: ${req.header('ce-subject')}`);
});

module.exports = app;
// [END run_events_gcs_handler]
