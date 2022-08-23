// Copyright 2022 Google LLC
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

const assert = require('assert');
const sinon = require('sinon');

const program = require('..');

describe('index.test.js', () => {
  describe('functions_helloworld_error', () => {
    describe('Error handling (unit tests)', () => {
      it('helloError: should throw an error', () => {
        assert.throws(program.helloError, 'Error: I failed you');
      });

      it('helloError2: should throw a value', () => {
        assert.throws(program.helloError2, '1');
      });

      it('helloError3: callback should return an errback value', () => {
        const cb = sinon.stub();
        program.helloError3(null, null, cb);
        assert.ok(cb.calledOnce);
        assert.ok(cb.calledWith('I failed you'));
      });
    });
  });
});
