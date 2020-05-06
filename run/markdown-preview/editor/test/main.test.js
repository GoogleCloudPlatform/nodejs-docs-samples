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

'use strict';

const assert = require('assert');
const path = require('path');
const supertest = require('supertest');

let request, template, htmlString, markdownString, falseString;

describe('Editor unit tests', () => {
  describe('Service init', () => {
    it('should respond with an error for no EDITOR_UPSTREAM_RENDER_URL var', async () => {
      request = () => require(path.join(__dirname, '..', 'main'));
      assert.throws(request, {name: 'Error', message: 'No configuration for upstream render service: add EDITOR_UPSTREAM_RENDER_URL environment variable'})
    });

    it('should return an object with an EDITOR_UPSTREAM_RENDER_URL var', async () => {
      // Reload the server with updated env vars.
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {app, init} = require(path.join(__dirname, '..', 'main'));
      request = supertest(app);
      const response = init();
      assert.equal(response.url, process.env.EDITOR_UPSTREAM_RENDER_URL);
      assert.equal(response.url, 'https://www.example.com/');
      assert.equal(response.isAuthenticated, true);
    })
  });

  describe('Handlebars compiler', async () => {
    before(async () => {
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {app, buildTemplate} = require(path.join(__dirname, '..', 'main'));
      request = supertest(app);
      template = buildTemplate();
    })

    it('includes HTML from the templates', () => {
      htmlString = template.includes('<title>Markdown Editor</title>');
      assert.equal(htmlString, true);
    });

    it('includes Markdown from the templates', () => {
      markdownString = template.includes("This UI allows a user to write Markdown text");
      assert.equal(markdownString, true)
    });

    it('accurately checks the template for nonexistant string', () => {
      falseString = template.includes("not a string in the template");
      assert.equal(falseString, false);      
    });
  });

  describe('Render request', () => {
    it('should respond with Not Found for a GET request to the /render endpoint', async () => {
      await request.get('/render').expect(404);
    });

    it('should respond with a Bad Request for a request with invalid JSON', async () => {
      await request.post('/render').type('json').send('invalid string').expect(400);
    });
    
    it('should successfully make a request with valid JSON', async function () {
      this.timeout(5000);
      // Reload the server with updated env vars.
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {app} = require(path.join(__dirname, '..', 'main'));
      request = supertest(app);
      await request.post('/render').type('json').send({data:"valid string"}).expect(500);
    });
  });
});
