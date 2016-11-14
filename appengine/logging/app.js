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

const express = require('express');
const app = express();

const winston = require('winston');
require('winston-gae');

const logger = new winston.Logger({
  levels: winston.config.GoogleAppEngine.levels,
  transports: [
    new winston.transports.GoogleAppEngine({
      // capture logs at emergency and above (all levels)
      level: 'emergency'
    })
  ]
});

app.get('/', (req, res) => {
  logger.info(`Request from ${req.ip}`);
  res.status(200).send('Logged');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});
// [END app]
