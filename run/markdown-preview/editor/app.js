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
const handlebars = require('handlebars');
const {readFile} = require('fs').promises;
const renderRequest = require('./render.js');

const app = express();
app.use(express.json());

let markdownDefault, compiledTemplate, renderedHtml;

// Load the template files and serve them with the Editor service.
const buildRenderedHtml = async () => {
  try {
    markdownDefault = await readFile(__dirname + '/templates/markdown.md');
    compiledTemplate = handlebars.compile(
      await readFile(__dirname + '/templates/index.html', 'utf8')
    );
    renderedHtml = compiledTemplate({default: markdownDefault});
    return renderedHtml;
  } catch (err) {
    throw Error('Error loading template: ', err);
  }
};

app.get('/', async (req, res) => {
  try {
    if (!renderedHtml) renderedHtml = await buildRenderedHtml();
    res.status(200).send(renderedHtml);
  } catch (err) {
    console.log('Error loading the Editor service: ', err);
    res.status(500).send(err);
  }
});

// The renderRequest makes a request to the Renderer service.
// The request returns the Markdown text converted to HTML.
// [START cloudrun_secure_request_do]
// [START run_secure_request_do]
app.post('/render', async (req, res) => {
  try {
    const markdown = req.body.data;
    const response = await renderRequest(markdown);
    res.status(200).send(response);
  } catch (err) {
    console.log('error: markdown rendering:', err);
    res.status(500).send(err);
  }
});
// [END run_secure_request_do]
// [END cloudrun_secure_request_do]

// Exports for testing purposes.
module.exports = {
  app,
  buildRenderedHtml,
};
