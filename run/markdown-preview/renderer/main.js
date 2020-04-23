// Copyright 2020 Google LLC
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

const express = require('express');
const MarkdownIt = require('markdown-it');
const xss = require('xss');

const app = express();

app.use(express.json());

app.post('/', (req, res) => {
  try {

    // Get the Markdown text and convert it into HTML using markdown-it
    const markdown = req.body.markdown;
    const md = new MarkdownIt();
    const unsafeData = md.render(markdown);

    // Add XSS sanitizer
    const safeData = xss(unsafeData);
    const response = JSON.stringify({data: safeData});
    res.send(response);
  
  } catch(err) {
    console.log('Error: ', err);
    res.send(err);
  }
})

const port = process.env.PORT || 8080;

app.listen(port, err => {
  if (err) console.log('Error: ', err);
  console.log('Renderer is listening on port ', port);
})
