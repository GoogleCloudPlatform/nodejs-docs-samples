/**
 * Copyright 2016, Google, Inc.
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

// [START app]
'use strict';

const exec = require('child_process').exec;
const express = require('express');

const app = express();

app.get('/', (req, res, next) => {
  // Get the output from the "fortune" program. This is installed into the
  // environment by the Dockerfile.
  exec('/usr/games/fortune', (err, stdout) => {
    if (err) {
      next(err);
      return;
    }

    res.set('Content-Type', 'text/plain');
    res.status(200).send(stdout);
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
