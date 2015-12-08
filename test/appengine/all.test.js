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
var fs = require('fs');
var async = require('async');
var cwd = process.cwd();
var projectId = process.env.TEST_PROJECT_ID || 'nodejs-docs-samples';

function getPath(dir) {
  return cwd + '/appengine/' + dir;
}

var sampleTests = [
  {
    dir: 'bower',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Using jquery, installed via Bower.'
  },
  {
    dir: 'express',
    deploy: true,
    promote: true,
    cmd: 'node',
    args: ['./bin/www'],
    msg: 'Hello World! Express.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '0.10'
  },
  {
    dir: 'express-memcached-session',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Viewed',
    TRAVIS_NODE_VERSION: '0.10'
  },
  {
    dir: 'geddy',
    cmd: 'node',
    args: ['node_modules/geddy/bin/cli.js'],
    msg: 'Hello, World! Geddy.js on Google App Engine.'
  },
  {
    dir: 'grunt',
    deploy: true,
    cmd: 'node',
    args: ['./src/bin/www'],
    msg: 'Hello World! Express.js + Grunt.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '0.12'
  },
  {
    dir: 'hapi',
    cmd: 'node',
    args: ['index.js'],
    msg: 'Hello World! Hapi.js on Google App Engine.'
  },
  {
    dir: 'kraken',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello World! Kraken.js on Google App Engine.',
    code: 304
  },
  {
    dir: 'loopback',
    cmd: 'node',
    args: ['server/server.js'],
    msg: 'LoopBack.js on Google App Engine.',
    code: 304
  },
  {
    dir: 'mailgun',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Express.js + Mailgun on Google App Engine.'
  },
  {
    dir: 'redis',
    cmd: 'node',
    args: ['server.js'],
    msg: '127.0.0.1'
  },
  {
    dir: 'restify',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello World! Restify.js on Google App Engine.'
  },
  {
    dir: 'sendgrid',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Express.js + Sendgrid on Google App Engine.'
  },
  {
    dir: 'webpack',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Loaded module <span>foo</span> via Webpack.'
  }
];

if (process.env.TRAVIS_NODE_VERSION === '0.10') {
  // For some reason the "npm install" step for the Sails sample doesn't work on
  // Travis when using Node.js stable. It works locally, however.
  sampleTests.push({
    dir: 'sails',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Hello World! Sails.js on Google App Engine.',
    timeout: 240000
  });
}

if (process.env.TRAVIS_NODE_VERSION === 'stable') {
  // For some reason the "npm install" step for the Sails sample doesn't work on
  // Travis when using Node.js stable. It works locally, however.
  sampleTests.push({
    dir: 'koa',
    deploy: true,
    cmd: 'node',
    args: ['--harmony', 'app.js'],
    msg: 'Hello World! Koa.js on Google App Engine.',
    TRAVIS_NODE_VERSION: 'stable'
  });
}

// Send a request to the given url and test that the response body has the
// expected value
function testRequest(url, sample, cb) {
  request(url, function (err, res, body) {
    if (err) {
      // Request error
      return cb(err);
    } else {
      if (body && body.indexOf(sample.msg) !== -1 &&
            (res.statusCode === 200 || res.statusCode === sample.code)) {
        // Success
        return cb(null, true);
      } else {
        // Short-circuit app test
        var message = sample.dir + ': failed verification!\n' +
                      'Expected: ' + sample.msg + '\n' +
                      'Actual: ' + body;

        // Response body did not match expected
        return cb(new Error(message));
      }
    } 
  });
}

describe('appengine/', function () {
  sampleTests.forEach(function (sample) {
    it(sample.dir + ': dependencies should install', function (done) {
      // Allow extra time for "npm install"
      this.timeout(sample.timeout || 120000);

      testInstallation(sample, done);
    });

    it(sample.dir + ' should return 200 and Hello World', function (done) {
      testLocalApp(sample, done);
    });
  });

  if (!process.env.TRAVIS) {
    return;
  }

  it('should deploy all samples', function (done) {
    // 30 minutes because deployments are slow
    this.timeout(30 * 60 * 1000);

    testDeployments(done);
  });
});

function testInstallation(sample, done) {

  // Keep track off whether "done" has been called yet
  var calledDone = false;

  var proc = spawn('npm', ['install'], {
    cwd: getPath(sample.dir)
  });

  proc.on('error', finish);

  if (!process.env.TRAVIS) {
    proc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  }

  proc.on('exit', function (code) {
    if (code !== 0) {
      finish(new Error(sample.dir + ': failed to install dependencies!'));
    } else {
      finish();
    }
  });

  // Exit helper so we don't call "cb" more than once
  function finish(err) {
    if (!calledDone) {
      calledDone = true;
      done(err);
    }
  }
}

function testLocalApp(sample, done) {
  var calledDone = false;

  var proc = spawn(sample.cmd, sample.args, {
    cwd: getPath(sample.dir)
  });

  proc.on('error', finish);

  if (!process.env.TRAVIS) {
    proc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  }

  proc.on('exit', function (code, signal) {
    if (code !== 0 && signal !== 'SIGKILL') {
      return finish(new Error(sample.dir + ': failed to run!'));
    } else {
      return finish();
    }
  });

  // Give the server time to start up
  setTimeout(function () {
    // Test that the app is working
    testRequest('http://localhost:8080', sample, function (err) {
      proc.kill('SIGKILL');
      setTimeout(function () {
        return finish(err);
      }, 2000);
    });
  }, 5000);

  // Exit helper so we don't call "cb" more than once
  function finish(err) {
    if (!calledDone) {
      calledDone = true;
      done(err);
    }
  }
}

function testDeployments(done) {

  // Only deploy samples that have a projectId
  var samplesToDeploy = sampleTests.filter(function (sample) {
    return (sample.deploy &&
      process.env.TRAVIS_NODE_VERSION === sample.TRAVIS_NODE_VERSION);
  });

  // Create deployment tasks
  var tasks = samplesToDeploy.map(function (sample) {
    return function (cb) {
      // Keep track off whether "cb" has been called yet
      var calledDone = false;
      // Keep track off whether the logs have fully flushed
      var logFinished = false;

      var _cwd = getPath(sample.dir);
      var args = [
        'preview',
        'app',
        'deploy',
        'app.yaml',
        // Skip prompt
        '-q',
        '--project',
        projectId,
        // Deploy over existing version so we don't have to clean up
        '--version',
        sample.dir,
        // Override any existing deployment
        '--force',
        sample.promote ? '--promote' : '--no-promote',
        // Build locally, much faster
        '--docker-build',
        'local',
        '--verbosity',
        'debug'
      ];

      console.log(_cwd + ' $ gcloud ' + args.join(' '));

      var logFile = process.env.TRAVIS_BUILD_DIR + 
                    '/' +
                    sample.dir + 
                    '-' +
                    process.env.TRAVIS_BUILD_ID +
                    '-' +
                    process.env.TRAVIS_BUILD_NUMBER +
                    '-' +
                    process.env.TRAVIS_JOB_ID +
                    '-' +
                    process.env.TRAVIS_JOB_NUMBER +
                    '.log';

      var logStream = fs.createWriteStream(logFile, { flags: 'a' });

      // Don't use "npm run deploy" because we need extra flags
      var proc = spawn('gcloud', args, {
        cwd: _cwd
      });

      // Exit helper so we don't call "cb" more than once
      function finish(err, result) {
        if (!calledDone) {
          calledDone = true;
          var intervalId = setInterval(function () {
            if (logFinished) {
              clearInterval(intervalId);
              cb(err, result);
            }
          }, 1000);
        }
      }

      logStream.on('finish', function () {
        if (!logFinished) {
          logFinished = true;
        }
      });

      proc.stdout.pipe(logStream, { end: false });
      proc.stderr.pipe(logStream, { end: false });

      var numEnded = 0;

      function finishLogs() {
        numEnded++;
        if (numEnded === 2) {
          logStream.end();
          console.log('Saved logs for ' + sample.dir + ' to ' + logFile);
        }
      }
      
      proc.stdout.on('end', finishLogs);
      proc.stderr.on('end', finishLogs);

      // This is called if the process fails to start. "error" event may or may
      // not be fired in addition to the "exit" event.
      proc.on('error', finish);

      // Process has completed
      proc.on('exit', function (code) {
        if (code !== 0) { // Deployment failed
          // Pass error as second argument so we don't short-circuit the
          // parallel tasks
          return finish(null, new Error(sample.dir + ': failed to deploy!'));
        } else { // Deployment succeeded
          // Test that sample app is running successfully
          return async.waterfall([
            function (cb) {
              // Give apps time to start
              setTimeout(cb, 5000);
            },
            function (cb) {
              // Test versioned url of "default" module
              var demoUrl = 'http://' + sample.dir + '-dot-' + projectId +
                '.appspot.com';
              testRequest(demoUrl, sample, cb);
            }
          ], finish);
        }
      });
    };
  });

  // Deploy sample apps in parallel
  return async.parallel(tasks, function (err, results) {
    if (err) {
      return done(err);
    } else {
      var success = true;
      var message = '';
      // Find errors that didn't short-circuit the parallel tasks
      results.forEach(function (result) {
        if (result instanceof Error) {
          // Gather error messages
          message = message + result.message + '\n';
          success = false;
        } else {
          // "result" should be "true" for those apps that passed verification
          success = success && result;
        }
      });
      if (success) {
        return done();
      } else {
        return done(new Error(message));
      }
    }
  });
}
