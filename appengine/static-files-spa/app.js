// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// [START gae_flex_node_static_files_spa]
'use strict';

const path = require('path');
const express = require('express');
const app = express();

const STATIC_DIR = process.env.STATIC_DIR || 'public';
const staticFilesDir = path.join(__dirname, STATIC_DIR);
// Use the built-in express middleware for serving static files
app.use(express.static(staticFilesDir));

// All api routes go here

// support of client-side routing in SPA apps (all routes that are not api lead to root)
app.get('/*', function (req, res) {
  res.sendFile('index.html', { root:  staticFilesDir });
});

// Start the server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`App listening on http://localhost:${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

// [END gae_flex_node_static_files_spa]
module.exports = app;
