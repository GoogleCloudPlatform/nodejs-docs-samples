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

describe('Editor unit tests', () => {
  describe('Initialize app', () => {
    it('should successfully start the app', async function () {
      const {app} = require(path.join(__dirname, '..', 'main'));
      const request = supertest(app);
      await request.get('/').expect(200);
    })
  });

  describe('Handlebars compiler', async () => {
    let template;

    before( async () => {
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {buildRenderedHtml} = require(path.join(__dirname, '..', 'main'));
      template = await buildRenderedHtml();
    })

    it('includes HTML from the templates', () => {
      let htmlString = template.includes('<title>Markdown Editor</title>');
      assert.equal(htmlString, true);
    });

    it('includes Markdown from the templates', () => {
      let markdownString = template.includes("This UI allows a user to write Markdown text");
      assert.equal(markdownString, true)
    });

    it('accurately checks the template for nonexistant string', () => {
      let falseString = template.includes("not a string in the template");
      assert.equal(falseString, false);      
    });
  });

  describe('Render request', () => {
    let request;

    before(async () => {
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {app} = require(path.join(__dirname, '..', 'main'));
      request = supertest(app);
    });

    it('should respond with Not Found for a GET request to the /render endpoint', async () => {
      await request.get('/render').expect(404);
    });

    it('can make a POST request, with an error thrown if data type is incorrect', async function () {
      this.timeout(9000);
      // Ensure that the expected error is logged.
      let response = await request.post('/render').type('json').send({"data":"markdown"}).expect(500);
      assert.equal(response.error.message, 'cannot POST /render (500)');

      try {
        await request.post('/render').type('text/plain').send({"data":"markdown"}).expect(500);
      } catch (e) {
        const message = e.message.includes('The "string" argument must be of type string');
        assert.equal(message, true);
      };
    });
  });
});
