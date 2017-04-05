/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// [START app]
// [START import_libraries]
var async = require('async');
var fs = require('fs');
var path = require('path');

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://googlecloudplatform.github.io/gcloud-node/#/docs/google-cloud/latest/guides/authentication
var Vision = require('@google-cloud/vision');
var natural = require('natural');
var redis = require('redis');

// Instantiate a vision client
var vision = Vision();
// [END import_libraries]

function Index () {
  // Connect to a redis server.
  var TOKEN_DB = 0;
  var DOCS_DB = 1;
  var PORT = process.env.REDIS_PORT || '6379';
  var HOST = process.env.REDIS_HOST || '127.0.0.1';

  this.tokenClient = redis.createClient(PORT, HOST, {
    db: TOKEN_DB
  }).on('error', function (err) {
    console.error('ERR:REDIS: ' + err);
  });
  this.docsClient = redis.createClient(PORT, HOST, {
    db: DOCS_DB
  }).on('error', function (err) {
    console.error('ERR:REDIS: ' + err);
  });
}

Index.prototype.quit = function () {
  this.tokenClient.quit();
  this.docsClient.quit();
};

Index.prototype.add = function (filename, document, callback) {
  var self = this;
  var PUNCTUATION = ['.', ',', ':', ''];
  var tokenizer = new natural.WordTokenizer();
  var tokens = tokenizer.tokenize(document);

  // TODO: Remove stop words

  var tasks = tokens.filter(function (token) {
    return PUNCTUATION.indexOf(token) === -1;
  }).map(function (token) {
    return function (cb) {
      self.tokenClient.sadd(token, filename, cb);
    };
  });

  tasks.push(function (cb) {
    self.tokenClient.set(filename, document, cb);
  });

  async.parallel(tasks, callback);
};

Index.prototype.lookup = function (words, callback) {
  var self = this;
  var tasks = words.map(function (word) {
    word = word.toLowerCase();
    return function (cb) {
      self.tokenClient.smembers(word, cb);
    };
  });
  async.parallel(tasks, callback);
};

Index.prototype.documentIsProcessed = function (filename, callback) {
  this.docsClient.GET(filename, function (err, value) {
    if (err) {
      return callback(err);
    }
    if (value) {
      console.log(filename + ' already added to index.');
      callback(null, true);
    } else if (value === '') {
      console.log(filename + ' was already checked, and contains no text.');
      callback(null, true);
    } else {
      callback(null, false);
    }
  });
};

Index.prototype.setContainsNoText = function (filename, callback) {
  this.docsClient.set(filename, '', callback);
};

function lookup (words, callback) {
  var index = new Index();
  index.lookup(words, function (err, hits) {
    index.quit();
    if (err) {
      return callback(err);
    }
    words.forEach(function (word, i) {
      console.log('hits for "' + word + '":', hits[i].join(', '));
    });
    callback(null, hits);
  });
}

// [START extract_descrs]
function extractDescription (texts) {
  var document = '';
  texts.forEach(function (text) {
    document += (text.desc || '');
  });
  return document;
}

function extractDescriptions (filename, index, texts, callback) {
  if (texts.length) {
    index.add(filename, extractDescription(texts), callback);
  } else {
    console.log(filename + ' had no discernable text.');
    index.setContainsNoText(filename, callback);
  }
}
// [END extract_descrs]

// [START get_text]
function getTextFromFiles (index, inputFiles, callback) {
  var options = { verbose: true };

  // Make a call to the Vision API to detect text
  vision.detectText(inputFiles, options, function (err, detections) {
    if (err) {
      return callback(err);
    }
    var textResponse = {};
    var tasks = [];
    inputFiles.forEach(function (filename, i) {
      var response = detections[i];
      if (response.error) {
        console.log('API Error for ' + filename, response.error);
        return;
      } else if (Array.isArray(response)) {
        textResponse[filename] = 1;
      } else {
        textResponse[filename] = 0;
      }
      tasks.push(function (cb) {
        extractDescriptions(filename, index, response, cb);
      });
    });
    async.parallel(tasks, function (err) {
      if (err) {
        return callback(err);
      }
      callback(null, textResponse);
    });
  });
}

// Run the example
function main (inputDir, callback) {
  var index = new Index();

  async.waterfall([
    // Scan the specified directory for files
    function (cb) {
      fs.readdir(inputDir, cb);
    },
    // Separate directories from files
    function (files, cb) {
      async.parallel(files.map(function (file) {
        var filename = path.join(inputDir, file);
        return function (cb) {
          fs.stat(filename, function (err, stats) {
            if (err) {
              return cb(err);
            }
            if (!stats.isDirectory()) {
              return cb(null, filename);
            }
            cb();
          });
        };
      }), cb);
    },
    // Figure out which files have already been processed
    function (allImageFiles, cb) {
      var tasks = allImageFiles.filter(function (filename) {
        return filename;
      }).map(function (filename) {
        return function (cb) {
          index.documentIsProcessed(filename, function (err, processed) {
            if (err) {
              return cb(err);
            }
            if (!processed) {
              // Forward this filename on for further processing
              return cb(null, filename);
            }
            cb();
          });
        };
      });
      async.parallel(tasks, cb);
    },
    // Analyze any remaining unprocessed files
    function (imageFilesToProcess, cb) {
      imageFilesToProcess = imageFilesToProcess.filter(function (filename) {
        return filename;
      });
      if (imageFilesToProcess.length) {
        return getTextFromFiles(index, imageFilesToProcess, cb);
      }
      console.log('All files processed!');
      cb();
    }
  ], function (err, result) {
    index.quit();
    callback(err, result);
  });
}
// [END get_text]

// [START run_application]
if (module === require.main) {
  var generalError = 'Usage: node textDetection <command> <arg> ...\n\n' +
    '\tCommands: analyze, lookup';
  if (process.argv.length < 3) {
    console.log(generalError);
    process.exit(1);
  }
  var args = process.argv.slice(2);
  var command = args.shift();
  if (command === 'analyze') {
    if (!args.length) {
      console.log('Usage: node textDetection analyze <dir>');
      process.exit(1);
    }
    main(args[0], console.log);
  } else if (command === 'lookup') {
    if (!args.length) {
      console.log('Usage: node textDetection lookup <word> ...');
      process.exit(1);
    }
    lookup(args, console.log);
  } else {
    console.log(generalError);
    process.exit(1);
  }
}
// [END run_application]
// [END app]

exports.Index = Index;
exports.lookup = lookup;
exports.getTextFromFiles = getTextFromFiles;
exports.main = main;
