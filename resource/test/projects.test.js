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

var proxyquire = require('proxyquire').noCallThru();

function getSample () {
  var projectsMock = [{ id: 'foo' }];
  var resourceMock = {
    getProjects: sinon.stub().yields(null, projectsMock, null, projectsMock)
  };
  var ResourceMock = sinon.stub().returns(resourceMock);

  return {
    program: proxyquire('../projects', {
      '@google-cloud/resource': ResourceMock,
      yargs: proxyquire('yargs', {})
    }),
    mocks: {
      Resource: ResourceMock,
      resource: resourceMock,
      projects: projectsMock
    }
  };
}

describe('resource:projects', function () {
  describe('listProjects', function () {
    it('should list projects', function () {
      var sample = getSample();
      var callback = sinon.stub();

      sample.program.listProjects(callback);

      assert.equal(sample.mocks.resource.getProjects.calledOnce, true);
      assert.deepEqual(sample.mocks.resource.getProjects.firstCall.args.slice(0, -1), []);
      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [null, sample.mocks.projects]);
      assert.equal(console.log.calledOnce, true);
      assert.deepEqual(console.log.firstCall.args, ['Found %d project(s)!', sample.mocks.projects.length]);
    });

    it('should handle error', function () {
      var error = new Error('error');
      var sample = getSample();
      var callback = sinon.stub();
      sample.mocks.resource.getProjects.yields(error);

      sample.program.listProjects(callback);

      assert.equal(callback.calledOnce, true);
      assert.deepEqual(callback.firstCall.args, [error]);
    });
  });

  describe('main', function () {
    it('should call listProjects', function () {
      var program = getSample().program;

      sinon.stub(program, 'listProjects');
      program.main(['list']);
      assert.equal(program.listProjects.calledOnce, true);
      assert.deepEqual(program.listProjects.firstCall.args.slice(0, -1), []);
    });
  });
});
