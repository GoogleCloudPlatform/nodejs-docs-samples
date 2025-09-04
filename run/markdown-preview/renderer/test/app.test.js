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

import assert from 'assert';
import path from 'path';
import sinon from 'sinon';
import supertest from 'supertest';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let request;

describe('Unit Tests', () => {
  before(async () => {
    const appModule = await import(path.join(__dirname, '..', 'app.js'));
    request = supertest(appModule.default);
  });

  it('should return Bad Request with an invalid type', async () => {
    const consoleStub = sinon.stub(console, 'log');
    // Ensure that the expected error is logged.
    await request.post('/').type('json').send({json: 'json'});
    const message = console.log.getCall(0).args[0];
    assert.equal(message, 'Markdown data could not be retrieved.');
    consoleStub.restore();
  });

  it('should succeed with a valid request', async () => {
    const markdown = '**markdown text**';
    const response = await request
      .post('/')
      .type('text')
      .send(markdown)
      .retry(3)
      .expect(200);
    const body = response.text;
    assert.equal(body, '<p><strong>markdown text</strong></p>\n');
  });

  it('should succeed with a request that includes xss', async () => {
    let markdown = '<script>script</script>';
    await request
      .post('/')
      .type('text')
      .send(markdown)
      .retry(3)
      .expect(200)
      .then(res => {
        const body = res.text;
        assert.deepStrictEqual(
          body,
          '<p>&lt;script&gt;script&lt;/script&gt;</p>\n'
        );
      });
    markdown =
      '<a onblur="alert(secret)" href="http://www.google.com">Google</a>';
    await request
      .post('/')
      .type('text')
      .send(markdown)
      .retry(3)
      .expect(200)
      .then(res => {
        const body = res.text;
        assert.deepStrictEqual(
          body,
          '<p>&lt;a onblur=&quot;alert(secret)&quot; href=&quot;http://www.google.com&quot;&gt;Google&lt;/a&gt;</p>\n'
        );
      });
  });
});
