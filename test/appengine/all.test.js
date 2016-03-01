// Copyright 2015-2016, Google, Inc.
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
var projectId = process.env.GCLOUD_PROJECT;

function getPath(dir) {
  return cwd + '/appengine/' + dir;
}

function changeScaling(dir) {
  try {
    var filepath = getPath(dir) + '/app.yaml';
    fs.statSync(filepath);

    var appYaml = fs.readFileSync(filepath, { encoding: 'utf8' });

    appYaml = appYaml + '\n\nmanual_scaling:\n  instances: 1\n';
    fs.writeFileSync(filepath, appYaml, { encoding: 'utf8' });
  } catch (err) {
    console.error(err);
  }
}

var sampleTests = [
  {
    dir: 'analytics',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Event tracked.'
  },
  {
    dir: 'bower',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Express.js + Bower on Google App Engine.'
  },
  {
    dir: 'brunch',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Brunch with ES6 running on Google App Engine.',
    TRAVIS: true
  },
  {
    dir: 'cloudsql',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Last 10 visits:',
    TRAVIS: true
  },
  {
    dir: 'datastore',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Last 10 visits:'
  },
  {
    dir: 'disk',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Instance:'
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
    dir: 'hello-world',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Hello, world!'
  },
  {
    dir: 'kraken',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello World! Kraken.js on Google App Engine.',
    code: 304
  },
  {
    dir: 'logging',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Logged'
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
    dir: 'memcached',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Value:',
    test: /Value: \d\.\d+/
  },
  {
    dir: 'mongodb',
    cmd: 'node',
    args: ['server.js'],
    msg: 'IPs:',
    TRAVIS: true
  },
  {
    dir: 'pubsub',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Messages received by this instance:',
    env: {
      PUBSUB_TOPIC: 'test',
      PUBSUB_VERIFICATION_TOKEN: 'foo'
    }
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
    dir: 'static-files',
    cmd: 'node',
    args: ['app.js'],
    msg: 'This is a static file serving example.'
  },
  {
    dir: 'storage',
    cmd: 'node',
    args: ['app.js'],
    msg: '<title>Static Files</title>',
    env: {
      GCLOUD_STORAGE_BUCKET: 'nodejs-docs-samples'
    }
  },
  {
    dir: 'webpack',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Express.js + Webpack on Google App Engine.'
  },
  {
    dir: 'websockets',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Echo demo'
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
  sampleTests.push({
    dir: 'hapi',
    cmd: 'node',
    args: ['index.js'],
    msg: 'Hello World! Hapi.js on Google App Engine.',
    TRAVIS_NODE_VERSION: 'stable'
  });
  sampleTests.push({
    dir: 'koa',
    deploy: true,
    cmd: 'node',
    args: ['--harmony', 'app.js'],
    msg: 'Hello World! Koa.js on Google App Engine.',
    TRAVIS_NODE_VERSION: 'stable'
  });
  sampleTests.push({
    dir: 'parse-server',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello, world!',
    TRAVIS_NODE_VERSION: 'stable',
    env: {
      APP_ID: 'foo',
      MASTER_KEY: 'bar',
      SERVER_URL: 'http://localhost:'
    }
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
            (res.statusCode === 200 || res.statusCode === sample.code) &&
            (!sample.test || sample.test.test(body))) {
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
  var port = 8080;
  sampleTests.forEach(function (sample) {
    sample.env = sample.env || {};
    sample.env.PORT = port;
    if (sample.dir === 'parse-server') {
      sample.env.SERVER_URL = sample.env.SERVER_URL + port + '/parse';
      console.log(sample);
    }
    port++;
    it(sample.dir + ': dependencies should install', function (done) {
      // Allow extra time for "npm install"
      this.timeout(sample.timeout || 120000);

      testInstallation(sample, done);
    });

    if (sample.TRAVIS && !process.env.TRAVIS) {
      return;
    }

    it(sample.dir + ' should return 200 and Hello World', function (done) {
      testLocalApp(sample, done);
    });
  });

  if (!process.env.TRAVIS || !process.env.DEPLOY_TESTS) {
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
  var requestError;

  var opts = {
    cwd: getPath(sample.dir)
  };
  if (sample.env) {
    opts.env = sample.env;
    for (var key in process.env) {
      if (process.env.hasOwnProperty(key)) {
        opts.env[key] = process.env[key];
      }
    }
  }
  console.log('\t' + sample.dir + ': Start server on port ' + sample.env.PORT);
  var proc = spawn(sample.cmd, sample.args, opts);

  proc.on('error', function (err) {
    console.log('\t' + sample.dir + ': ERROR', err.message);
    finish(err);
  });

  if (!process.env.TRAVIS) {
    proc.stderr.on('data', function (data) {
      console.log('stderr: ' + data);
    });
  }

  proc.on('exit', function (code, signal) {
    if (signal === 'SIGKILL') {
      console.log('\t' + sample.dir + ': SIGKILL received!');
    }
    if (code !== 0 && signal !== 'SIGKILL') {
      console.log('\t' + sample.dir + ': ERROR', code, signal);
      return finish(new Error(sample.dir + ': failed to run!'));
    } else {
      return finish();
    }
  });

  // Give the server time to start up
  setTimeout(function () {
    console.log('\t' + sample.dir + ': Send test request...');
    // Test that the app is working
    var url = 'http://localhost:' + sample.env.PORT;
    testRequest(url, sample, function (err, result) {
      requestError = err;
      if (result) {
        console.log('\t' + sample.dir + ': Success!');
      }
      console.log('\t' + sample.dir + ': Send shutdown signal...');
      proc.kill('SIGKILL');
    });
  }, 5000);

  // Exit helper so we don't call "cb" more than once
  function finish(err) {
    if (!calledDone) {
      calledDone = true;
      done(err || requestError);
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

      // Manually set # of instances to 1
      changeScaling(sample.dir);

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
