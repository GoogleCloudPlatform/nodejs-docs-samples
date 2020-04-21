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
const handlebars = require('handlebars');
const { readFileSync } = require('fs');

const renderService = () => {
  const url = process.env.EDITOR_UPSTREAM_RENDER_URL;
  if (!url) throw Error ("no configuration for upstream render service: add EDITOR_UPSTREAM_RENDER_URL environment variable");
  const auth = process.env.EDITOR_UPSTREAM_AUTHENTICATED;
  if (!auth) console.log("editor: starting in unauthenticated upstream mode");

	// The use case of this service is the UI driven by these files.
	// Loading them as part of the server startup process keeps failures easily
	// discoverable and minimizes latency for the first request.
  
  const template = handlebars.compile(readFileSync(__dirname + '/templates/index.html', 'utf8'));
  const markdownDefault = readFileSync(__dirname + '/templates/markdown.md');

  const parsedTemplate = template({ default: markdownDefault});

  ///// possibly de-objectify this service
  const service = {
    url: url,
    isAuthenticated: auth,  
    parsedTemplate: parsedTemplate,
    markdownDefault: markdownDefault
  }

  return service;

};

module.exports = {
  renderService
}