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

'use strict';

const request = require('supertest');
const path = require('path');

process.env.GOOGLE_PROJECT_ID = 'fake-id';
process.env.GOOGLE_APPLICATION_CREDENTIALS = 'fake-creds';

const app = require(path.join(__dirname, '../', 'app.js'));

it('should be listening', async () => {
  await request(app)
    .get('/')
    .expect('Content-Type', /text\/html/);
});

it('should be exposing metrics', async () => {
  await request(app).get('/metrics').expect(200);
});
