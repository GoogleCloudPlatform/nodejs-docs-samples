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
const { readFileSync } = require('fs');
const renderRequest = require('./render.js');

const app = express();
app.use(express.json());

let url, isAuthenticated, markdownDefault, compiledTemplate, template;

const init = () => {
  url = process.env.EDITOR_UPSTREAM_RENDER_URL;
  if (!url) throw Error ("No configuration for upstream render service: add EDITOR_UPSTREAM_RENDER_URL environment variable");
  isAuthenticated = !process.env.EDITOR_UPSTREAM_UNAUTHENTICATED;
  if (!isAuthenticated) console.log("Editor: starting in unauthenticated upstream mode");
  return {url, isAuthenticated};
};

const service = init();

// Load the template files and serve them with the Editor service.
const buildTemplate = () => {
  try {
    markdownDefault = readFileSync(__dirname + '/templates/markdown.md');
    const indexTemplate = handlebars.compile(readFileSync(__dirname + '/templates/index.html', 'utf8'));
    compiledTemplate = indexTemplate({default: markdownDefault});
    return compiledTemplate;
  } catch(err) {
    throw Error ('Error loading template: ', err);
  }
};

app.get('/', (req, res) => { 
  try {
    template = buildTemplate();
    res.status(200).send(template);
  } catch (err) {
    console.log('Error loading the Editor service: ', err);
    res.status(500).send(err);
  }
});

// The renderRequest makes a request to the Renderer service. 
// The request returns the Markdown text converted to HTML.
app.post('/render', async (req, res) => {
  try {
    const markdown = req.body;
    const response = await renderRequest(service, markdown);
    res.status(200).send(response.body);
  } catch (err) {
    console.log('Error querying the Renderer service: ', err);
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, err => {
  console.log(`Editor service is listening on port ${PORT}`);
});

// Exports for testing purposes.
module.exports = {
  app,
  init,
  buildTemplate
};