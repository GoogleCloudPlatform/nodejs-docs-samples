// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var analyzeExample = require('../../language/analyze');

describe('language:analyze', function () {
  it('should analyze sentiment in text', function (done) {
    analyzeExample.main(
      'sentiment',
      'This gazinga pin is bad and it should feel bad',
      function (err, result) {
        assert.ifError(err);
        assert(result);
        assert(result.documentSentiment);
        assert(result.documentSentiment.polarity < 0);
        done();
      }
    );
  });
  it('should analyze entities in text', function (done) {
    analyzeExample.main(
      'entities',
      'Mark Twain is the author of a book called Tom Sawyer',
      function (err, result) {
        assert.ifError(err);
        assert(result);
        assert(result.entities && result.entities.length);
        assert(result.entities[0].name === 'Mark Twain');
        assert(result.entities[0].type === 'PERSON');
        done();
      }
    );
  });
  it('should analyze syntax in text', function (done) {
    analyzeExample.main(
      'syntax',
      'Betty bought a bit of bitter butter. But she said, "This butter\'s ' +
      'bitter! If I put it in my batter, it will make my batter bitter. If I ' +
      'buy some better butter - better than this bitter butter - it will ' +
      'make my batter better."',
      function (err, result) {
        assert.ifError(err);
        assert(result);
        assert(result.sentences && result.sentences.length);
        assert(result.tokens && result.tokens.length > 5);
        done();
      }
    );
  });
});
