// Copyright 2025 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const {receiveRequestAndParseAuthHeader} = require('./receive');

const app = express();

app.get('/', async (req, res) => {
  try {
    const response = await receiveRequestAndParseAuthHeader(req);

    const status = response.includes('Hello') ? 200 : 401;
    res.status(status).send(response);
  } catch (e) {
    res.status(401).send(`Error verifying ID token: ${e.message}`);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
