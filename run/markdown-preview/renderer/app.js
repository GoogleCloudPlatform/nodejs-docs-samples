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

const app = express();
app.use(express.text());

app.post('/', (req, res) => {
  if (typeof req.body !== 'string') {
    const msg = 'Markdown data could not be retrieved.';
    console.log(msg);
    res.status(400).send(`Error: ${msg}`);
    return;
  }
  const markdown = req.body;
  try {
    // Get the Markdown text and convert it into HTML using markdown-it.
    // For details about XSS prevention in markdown-it,
    // see https://github.com/markdown-it/markdown-it/blob/master/docs/security.md
    const md = new MarkdownIt();
    const html = md.render(markdown);
    res.status(200).send(html);
  } catch (err) {
    console.log('Error rendering Markdown: ', err);
    res.status(400).send(err);
  }
});

// Export for testing purposes.
module.exports = app;
