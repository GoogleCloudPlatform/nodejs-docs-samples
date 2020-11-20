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
    it('should successfully load the index page', async () => {
      const {app} = require(path.join(__dirname, '..', 'app'));
      const request = supertest(app);
      await request.get('/').expect(200);
    });
  });

  describe('Handlebars compiler', async () => {
    let template;

    before(async () => {
      const {buildRenderedHtml} = require(path.join(__dirname, '..', 'app'));
      template = await buildRenderedHtml();
    });

    it('includes HTML from the templates', () => {
      const htmlString = template.includes('<title>Markdown Editor</title>');
      assert.equal(htmlString, true);
    });
  });
});

describe('Integration tests', () => {
  describe('Render request', () => {
    let request;

    before(async () => {
      process.env.EDITOR_UPSTREAM_RENDER_URL = 'https://www.example.com/';
      const {app} = require(path.join(__dirname, '..', 'app'));
      request = supertest(app);
    });

    it('responds 404 Not Found on "GET /render"', async () => {
      await request.get('/render').expect(404);
    });

    it('responds 200 OK on "POST /render" with valid JSON', async () => {
      // A valid type will make a request to the /render endpoint.
      // TODO: This test outputs a JSON parsing SyntaxError from supertest but does not fail the assert.
      await request
        .post('/render')
        .type('json')
        .set('Accept', 'text/html')
        .send({data: 'markdown'})
        .expect(200)
        .expect('content-type', 'text/html; charset=utf-8');
    });

    it('responds 400 Bad Request on "POST /render" without valid JSON', async () => {
      // An incorrect type will not successfully make a request and will print an error in the console.
      await request
        .post('/render')
        .type('json')
        .send('string: incorrect data type')
        .expect(400);
    });
  });
});
