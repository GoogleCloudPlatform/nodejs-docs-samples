// Copyright 2023 Google LLC
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

const assert = require('chai').expect;

describe('End-to-end test', () => {
  before(() => {
    console.log('Run e2e_test_setup');
  });
  after(() => {
    console.log('Run e2e_test_cleanup');
  });
  it('completes Cloud Build e2e', () => {
    assert(true).to.eql(true); // temp assert
  });
});
