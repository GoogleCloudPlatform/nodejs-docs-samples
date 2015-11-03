// Copyright 2015, Google, Inc.
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

var spawn = require('child_process').spawn;
var request = require('request');

var cwd = process.cwd();

function getPath(dir) {
  return cwd + '/appengine/' + dir;
}

var sampleTests = [
  {
    dir: 'express',
    cmd: 'node',
    arg1: './bin/www',
    msg: 'Hello World! Express.js on Google App Engine.'
  },
  {
    dir: 'geddy',
    cmd: 'node',
    arg1: 'node_modules/geddy/bin/cli.js',
    msg: 'Hello, World! Geddy.js on Google App Engine.'
  },
  {
    dir: 'grunt',
    cmd: 'node',
    arg1: './src/bin/www',
    msg: 'Hello World! Express.js + Grunt.js on Google App Engine.'
  },
  {
    dir: 'hapi',
    cmd: 'node',
    arg1: 'index.js',
    msg: 'Hello World! Hapi.js on Google App Engine.'
  },
  {
    dir: 'kraken',
    cmd: 'node',
    arg1: 'server.js',
    msg: 'Hello World! Kraken.js on Google App Engine.',
    code: 304
  },
  {
    dir: 'loopback',
    cmd: 'node',
    arg1: 'server/server.js',
    msg: 'LoopBack.js on Google App Engine.',
    code: 304
  },
  {
    dir: 'mailgun',
    cmd: 'node',
    arg1: 'app.js',
    msg: 'Express.js + Mailgun on Google App Engine.'
  },
  {
    dir: 'redis',
    cmd: 'node',
    arg1: 'server.js',
    msg: '127.0.0.1'
  },
  {
    dir: 'restify',
    cmd: 'node',
    arg1: 'server.js',
    msg: 'Hello World! Restify.js on Google App Engine.'
  }
];

if (process.env.TRAVIS_NODE_VERSION !== 'stable') {
  // For some reason the "npm install" step for the Sails sample doesn't work on
  // Travis when using Node.js stable. It works locally, however.
  sampleTests.push({
    dir: 'sails',
    cmd: 'node',
    arg1: 'app.js',
    msg: 'Hello World! Sails.js on Google App Engine.',
    timeout: 240000
  });
}

describe('appengine/', function () {
  sampleTests.forEach(function (sample) {
    it(sample.dir + ': dependencies should install', function (done) {
      this.timeout(sample.timeout || 120000);
      var calledDone = false;

       var proc = spawn('npm', ['install'], {
        cwd: getPath(sample.dir)
      });

      proc.on('error', function (err) {
        if (!calledDone) {
          calledDone = true;
          done(err);
        }
      });

      if (!process.env.TRAVIS) {
        proc.stderr.on('data', function (data) {
          console.log('stderr: ' + data);
        });
      }

      proc.on('exit', function (code) {
        if (!calledDone) {
          calledDone = true;
          if (code !== 0) {
            done(new Error(sample.dir + ': failed to install dependencies!'));
          } else {
            done();
          }
        }
      });
    });

    it(sample.dir + ': should return 200 and Hello World', function (done) {
      var timeoutId;
      var intervalId;
      var success = false;
      var calledDone = false;

      var proc = spawn(sample.cmd, [sample.arg1], {
        cwd: getPath(sample.dir)
      });

      proc.on('error', function (err) {
        if (!calledDone) {
          calledDone = true;
          done(err);
        }
      });

      if (!process.env.TRAVIS) {
        proc.stderr.on('data', function (data) {
          console.log('stderr: ' + data);
        });
      }

      proc.on('exit', function (code, signal) {
        if (!calledDone) {
          calledDone = true;
          if (code !== 0 && signal !== 'SIGKILL') {
            done(new Error(sample.dir + ': failed to run!'));
          } else {
            if (!success) {
              done(new Error(sample.dir + ': failed verification!'));
            } else {
              done();
            }
          }
        }
      });

      timeoutId = setTimeout(end, 5000);
      intervalId = setInterval(testRequest, 1000);

      function end() {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        proc.kill('SIGKILL');
      }

      function testRequest() {
        request('http://localhost:8080', function (err, res, body) {
          if (body && body.indexOf(sample.msg) !== -1 &&
                (res.statusCode === 200 || res.statusCode === sample.code)) {
            success = true;
            end();
          }
        });
      }
    });
  });
});
