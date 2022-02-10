// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START cloudrun_broken_service]
// [START run_broken_service]
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  console.log('hello: received request.');

  // [START cloudrun_broken_service_problem]
  // [START run_broken_service_problem]
  const {NAME} = process.env;
  if (!NAME) {
    // Plain error logs do not appear in Stackdriver Error Reporting.
    console.error('Environment validation failed.');
    console.error(new Error('Missing required server parameter'));
    return res.status(500).send('Internal Server Error');
  }
  // [END run_broken_service_problem]
  // [END cloudrun_broken_service_problem]
  res.send(`Hello ${NAME}!`);
});
// [END run_broken_service]
// [END cloudrun_broken_service]

app.get('/improved', (req, res) => {
  console.log('hello: received request.');

  // [START cloudrun_broken_service_upgrade]
  // [START run_broken_service_upgrade]
  const NAME = process.env.NAME || 'World';
  if (!process.env.NAME) {
    console.log(
      JSON.stringify({
        severity: 'WARNING',
        message: `NAME not set, default to '${NAME}'`,
      })
    );
  }
  // [END run_broken_service_upgrade]
  // [END cloudrun_broken_service_upgrade]
  res.send(`Hello ${NAME}!`);
});

// [START cloudrun_broken_service]
// [START run_broken_service]
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
  console.log(`hello: listening on port ${port}`);
});
// [END run_broken_service]
// [END cloudrun_broken_service]
