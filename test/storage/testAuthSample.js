/**
 * @fileoverview Tests for the list-buckets module.
 */
'use strict';

var assert = require('assert');
var _ = require('lodash');

var authSample = require('../../storage/authSample');

describe('listBuckets', function() {
  it('returns a list of buckets', function(done) {
    authSample.listBuckets(
        process.env.TEST_PROJECT_ID,
        function(error, success) {
          if (error) {
            done('Should not have returned an error: ' + error);
          } else {
            assert(success.items.length > 0);
            assert(_.find(success.items, function(item) {
              return item.name === process.env.TEST_BUCKET_NAME;
            }));
            done();
          }
        });
  });
});

