// Copyright 2018 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('static'));

app.get('/full', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index.html'));
});

app.get('/min', (req, res) => {
  res.sendFile(path.join(__dirname, '/static/index_min.html'));
});

app.listen(PORT);
console.log(`App listening on port ${PORT}`);
