/**
 * Copyright 2017, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START debugger_app]
'use strict';

// [START debugger_setup_implicit]
require('@google-cloud/debug-agent').start();
// [END debugger_setup_implicit]

const express = require('express');
const app = express();

app.enable('trust proxy');

app.get('/', (req, res) => {
  // Try using the StackDriver Debugger dashboard to inspect the "req" object
  res.status(200).send('Hello, world!');
});

// Start the server
if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}
// [END debugger_app]

module.exports = app;
