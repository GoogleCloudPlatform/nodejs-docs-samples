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
var path = require('path');
var async = require('async');
var projectId = process.env.GCLOUD_PROJECT;

function getPath (dir) {
  return path.join(__dirname, '/../../', dir);
}

function changeScaling (dir) {
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
    dir: 'appengine/analytics',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Event tracked.'
  },
  {
    dir: 'appengine/bower',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Express.js + Bower on Google App Engine.'
  },
  // {
  //   dir: 'appengine/cloudsql',
  //   cmd: 'node',
  //   args: ['server.js'],
  //   msg: 'Last 10 visits:',
  //   TRAVIS_NODE_VERSION: '4'
  // },
  {
    dir: 'appengine/datastore',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Last 10 visits:'
  },
  {
    dir: 'appengine/disk',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Last 10 visits:'
  },
  {
    dir: 'appengine/errorreporting',
    cmd: 'node',
    args: ['app.js'],
    msg: 'something is wrong',
    code: 500
  },
  {
    dir: 'appengine/express',
    deploy: true,
    promote: true,
    cmd: 'node',
    args: ['./bin/www'],
    msg: 'Hello World! Express.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '0.12'
  },
  {
    dir: 'appengine/express-memcached-session',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Viewed',
    TRAVIS_NODE_VERSION: '0.12'
  },
  // {
  //   dir: 'appengine/geddy',
  //   cmd: 'node',
  //   args: ['node_modules/geddy/bin/cli.js'],
  //   msg: 'Hello, World! Geddy.js on Google App Engine.',
  //   TRAVIS_NODE_VERSION: '5'
  // },
  {
    dir: 'appengine/grunt',
    deploy: true,
    cmd: 'node',
    args: ['./src/bin/www'],
    msg: 'Hello World! Express.js + Grunt.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '0.12'
  },
  {
    dir: 'appengine/hello-world',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Hello, world!'
  },
  // {
  //   dir: 'appengine/kraken',
  //   cmd: 'node',
  //   args: ['server.js'],
  //   msg: 'Hello World! Kraken.js on Google App Engine.',
  //   code: 304
  // },
  {
    dir: 'appengine/logging',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Logged'
  },
  {
    dir: 'appengine/loopback',
    cmd: 'node',
    args: ['server/server.js'],
    msg: 'LoopBack.js on Google App Engine.',
    code: 304
  },
  {
    dir: 'appengine/mailgun',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Express.js + Mailgun on Google App Engine.'
  },
  {
    dir: 'appengine/mailjet',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Express.js + Mailjet on Google App Engine.'
  },
  {
    dir: 'appengine/memcached',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Value:',
    test: /Value: \d\.\d+/
  },
  {
    dir: 'appengine/mongodb',
    cmd: 'node',
    args: ['server.js'],
    msg: 'IPs:',
    TRAVIS: true
  },
  {
    dir: 'appengine/pubsub',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Messages received by this instance:',
    env: {
      PUBSUB_TOPIC: 'test',
      PUBSUB_VERIFICATION_TOKEN: 'foo'
    }
  },
  {
    dir: 'appengine/redis',
    cmd: 'node',
    args: ['server.js'],
    msg: '127.0.0.1'
  },
  {
    dir: 'appengine/restify',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello World! Restify.js on Google App Engine.'
  },
  {
    dir: 'appengine/sendgrid',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Express.js + Sendgrid on Google App Engine.'
  },
  {
    dir: 'appengine/static-files',
    cmd: 'node',
    args: ['app.js'],
    msg: 'This is a static file serving example.'
  },
  {
    dir: 'appengine/storage',
    cmd: 'node',
    args: ['app.js'],
    msg: '<title>Static Files</title>',
    env: {
      GCLOUD_STORAGE_BUCKET: 'nodejs-docs-samples'
    }
  },
  {
    dir: 'appengine/webpack',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Express.js + Webpack on Google App Engine.'
  },
  {
    dir: 'appengine/websockets',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Echo demo'
  },
  {
    dir: 'containerengine/hello-world',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello Kubernetes!'
  },
  {
    dir: 'debugger',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Hello, world!'
  },
  {
    dir: 'trace',
    cmd: 'node',
    args: ['app.js'],
    msg: 'acceleratedmobilepageurl'
  }
];

if (process.env.TRAVIS_NODE_VERSION === '0.12') {
  // For some reason the "npm install" step for the Sails sample doesn't work on
  // Travis when using Node.js 5.x. It works locally, however.
  sampleTests.push({
    dir: 'appengine/sails',
    cmd: 'node',
    args: ['app.js'],
    msg: 'Hello World! Sails.js on Google App Engine.',
    timeout: 240000
  });
}

if (process.env.TRAVIS_NODE_VERSION === '6') {
  sampleTests.push({
    dir: 'appengine/hapi',
    cmd: 'node',
    args: ['index.js'],
    msg: 'Hello World! Hapi.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '6'
  });
  sampleTests.push({
    dir: 'appengine/koa',
    deploy: true,
    cmd: 'node',
    args: ['--harmony', 'app.js'],
    msg: 'Hello World! Koa.js on Google App Engine.',
    TRAVIS_NODE_VERSION: '6'
  });
  sampleTests.push({
    dir: 'appengine/parse-server',
    cmd: 'node',
    args: ['server.js'],
    msg: 'Hello, world!',
    TRAVIS_NODE_VERSION: '6',
    env: {
      APP_ID: 'foo',
      MASTER_KEY: 'bar',
      SERVER_URL: 'http://localhost:'
    }
  });
}

// Retry the request using exponential backoff up to a maximum number of tries.
function makeRequest (url, numTry, maxTries, cb) {
  request(url, function (err, res, body) {
    if (err) {
      if (numTry >= maxTries) {
        return cb(err);
      }
      setTimeout(function () {
        makeRequest(url, numTry + 1, maxTries, cb);
      }, 500 * Math.pow(numTry, 2));
    } else {
      cb(null, res, body);
    }
  });
}

// Send a request to the given url and test that the response body has the
// expected value
function testRequest (url, sample, cb) {
  // Try up to 8 times
  makeRequest(url, 1, 8, function (err, res, body) {
    if (err) {
      // Request error
      return cb(err);
    }
    if (body && body.indexOf(sample.msg) !== -1 &&
          (res.statusCode === 200 || res.statusCode === sample.code) &&
          (!sample.test || sample.test.test(body))) {
      // Success
      return cb(null, true);
    }

    // Short-circuit app test
    var message = sample.dir + ': failed verification!\n' +
                  'Expected: ' + sample.msg + '\n' +
                  'Actual: ' + body;

    // Response body did not match expected
    cb(new Error(message));
  });
}

var port = 8080;
sampleTests.forEach(function (sample) {
  describe(sample.dir, function () {
    sample.env = sample.env || {};
    sample.env.PORT = port;
    if (sample.dir === 'appengine/parse-server') {
      sample.env.SERVER_URL = sample.env.SERVER_URL + port + '/parse';
    }
    port++;
    it.skip('should install dependencies', function (done) {
      testInstallation(sample, done);
    });

    if (sample.TRAVIS && !process.env.TRAVIS) {
      return;
    }

    if (sample.TRAVIS_NODE_VERSION && process.env.TRAVIS &&
      process.env.TRAVIS_NODE_VERSION !== sample.TRAVIS_NODE_VERSION) {
      return;
    }

    it('should return 200 and Hello World', function (done) {
      testLocalApp(sample, done);
    });
  });
});

if (process.env.TRAVIS && process.env.DEPLOY_TESTS) {
  describe('deployments', function () {
    it('should deploy all samples', function (done) {
      // 30 minutes because deployments are slow
      this.timeout(30 * 60 * 1000);

      testDeployments(done);
    });
  });
}

function testInstallation (sample, done) {
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
  function finish (err) {
    if (!calledDone) {
      calledDone = true;
      done(err);
    }
  }
}

function testLocalApp (sample, done) {
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

  // Exit helper so we don't call "cb" more than once
  function finish (err) {
    if (!calledDone) {
      calledDone = true;
      done(err || requestError);
    }
  }

  try {
    console.log('\t' + sample.dir + ': Testing app...');
    var url = 'http://localhost:' + sample.env.PORT;
    // Test that the app is working
    testRequest(url, sample, function (err, result) {
      requestError = err;
      if (result) {
        console.log('\t' + sample.dir + ': Success!');
      }
      console.log('\t' + sample.dir + ': Send shutdown signal...');
      proc.kill('SIGKILL');
    });

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
  } catch (err) {
    if (proc) {
      proc.kill('SIGKILL');
    }
  }
}

function testDeployments (done) {
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
      function finish (err, result) {
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

      function finishLogs () {
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
