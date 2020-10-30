// Copyright 2019 Google LLC
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

const path = require('path');
const supertest = require('supertest');

describe('Unit Tests', () => {
  const app = require(path.join(__dirname, '..', 'app'));
  const request = supertest(app);

  describe('should fail', () => {
    const errorContentType = 'text/html; charset=utf-8';

    it('should fail on a Bad Request with an empty query string', async () => {
      await request
        .get('/diagram.png')
        .type('text')
        .expect(400)
        .expect('Content-Type', errorContentType)
        .expect(res => {
          if (res.headers['cache-control']) {
            throw new Error('Found cache header on uncached response');
          }
        });
    });

    it('should fail on a Bad Request with an empty dot parameter', async () => {
      await request
        .get('/diagram.png')
        .type('text')
        .query({dot: ''})
        .expect(400)
        .expect('Content-Type', errorContentType)
        .expect(res => {
          if (res.headers['cache-control']) {
            throw new Error('Found cache header on uncached response');
          }
        });
    });

    it('should fail on a Bad Request with an invalid payload', async () => {
      await request
        .get('/diagram.png')
        .type('text')
        .query({dot: 'digraph'})
        .expect(400)
        .expect('Content-Type', errorContentType)
        .expect(res => {
          if (res.headers['cache-control']) {
            throw new Error('Found cache header on uncached response');
          }
        });
    });
  });

  describe('should succeed', () => {
    it('should succeed with a valid DOT description', async () => {
      await request
        .get('/diagram.png')
        .type('text')
        .query({dot: 'digraph G { A -> {B, C, D} -> {F} }'})
        .expect(200)
        .expect('Content-Type', 'image/png')
        .expect('Cache-Control', 'public, max-age=86400');
    });
  });
});
