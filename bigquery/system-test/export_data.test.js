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

var example = require('../export_data');
var options = {
  bucket: 'sample-bigquery-export',
  file: 'data.json',
  dataset: 'github_samples',
  table: 'natality'
};
var jobId = null;

describe('bigquery:export_data', function () {
  describe('export_table_to_gcs', function () {
    it('should export data to GCS', function (done) {
      example.exportTableToGCS(options, function (err, job) {
        assert.ifError(err);
        assert.notEqual(job, null);
        assert.notEqual(job.id, null);
        assert(job.id.length > 5);
        jobId = job.id;
        setTimeout(done, 100); // Wait for export job to be submitted
      });
    });
  });

  describe('export_poll', function () {
    it('should fetch job status', function (done) {
      assert.notEqual(jobId, null);
      var poller = function (tries) {
        example.pollExportJob(jobId, function (err, metadata) {
          if (!err || tries === 0) {
            assert.ifError(err);
            assert.equal(metadata.status.state, 'DONE');
            done();
          } else {
            setTimeout(function () { poller(tries - 1); }, 1000);
          }
        });
      };

      poller(60);
    });
  });
});
