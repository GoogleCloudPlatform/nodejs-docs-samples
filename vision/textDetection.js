// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

const fs = require('fs').promises;
const path = require('path');
const vision = require('@google-cloud/vision');
const natural = require('natural');
const redis = require('redis');

// By default, the client will authenticate using the service account file
// specified by the GOOGLE_APPLICATION_CREDENTIALS environment variable and use
// the project specified by the GCLOUD_PROJECT environment variable. See
// https://cloud.google.com/docs/authentication/getting-started#setting_the_environment_variable

// Instantiate a vision client
const client = new vision.ImageAnnotatorClient();

/**
 * State manager for text processing.  Stores and reads results from Redis.
 */
class Index {
  /**
   * Create a new Index object.
   */
  constructor() {
    // Connect to a redis server.
    const TOKEN_DB = 0;
    const DOCS_DB = 1;
    const PORT = process.env.REDIS_PORT || '6379';
    const HOST = process.env.REDIS_HOST || '127.0.0.1';

    this.tokenClient = redis
      .createClient({url: `redis://${HOST}:${PORT}`, db: TOKEN_DB})
      .on('error', err => {
        console.error('ERR:REDIS: ' + err);
        throw err;
      });
    this.docsClient = redis
      .createClient({url: `redis://${HOST}:${PORT}`, db: DOCS_DB})
      .on('error', err => {
        console.error('ERR:REDIS: ' + err);
        throw err;
      });

    (async () => {
      await this.tokenClient.connect();
      await this.docsClient.connect();
    })();
  }

  /**
   * Close all active redis server connections.
   */
  quit() {
    this.tokenClient.quit();
    this.docsClient.quit();
  }

  /**
   * Tokenize the given document.
   * @param {string} filename - key for the storage in redis
   * @param {string} document - Collection of words to be tokenized
   * @returns {Promise<void>}
   */
  async add(filename, document) {
    const PUNCTUATION = ['.', ',', ':', ''];
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(document);
    // filter out punctuation, then add all tokens to a redis set.
    await Promise.all(
      tokens
        .filter(token => PUNCTUATION.indexOf(token) === -1)
        .map(token => this.tokenClient.sAdd(token, filename))
    );
    await this.docsClient.set(filename, document);
  }

  /**
   * Lookup files that contain a given set of words in redis
   * @param {string[]} words An array of words to lookup
   * @returns {Promise<string[][]>} Words and their arrays of matching filenames
   */
  async lookup(words) {
    return Promise.all(
      words
        .map(word => word.toLowerCase())
        .map(word => this.tokenClient.sMembers(word))
    );
  }

  /**
   * Check to see if a Document is already stored in redis.
   * @param {string} filename
   * @returns {Promise<boolean>}
   */
  async documentIsProcessed(filename) {
    const value = await this.docsClient.get(filename);
    if (value) {
      console.log(`${filename} already added to index.`);
      return true;
    }
    if (value === '') {
      console.log(`${filename} was already checked, and contains no text.`);
      return true;
    }
    return false;
  }

  /**
   * Updates a given doc to have no text in redis.
   * @param {string} filename
   */
  async setContainsNoText(filename) {
    await this.docsClient.set(filename, '');
  }
}

/**
 * Given a list of words, lookup any matches in the database.
 * @param {string[]} words
 * @returns {Promise<string[][]>}
 */
async function lookup(words) {
  const index = new Index();
  const hits = await index.lookup(words);
  index.quit();
  words.forEach((word, i) => {
    console.log(`hits for "${word}":`, hits[i].join(', '));
  });
  return hits;
}

/**
 * Provide a joined string with all descriptions from the response data
 * @param {TextAnnotation[]} texts Response data from the Vision API
 * @returns {string} A joined string containing al descriptions
 */
function extractDescription(texts) {
  let document = '';
  texts.forEach(text => {
    document += text.description || '';
  });
  return document.toLowerCase();
}

/**
 * Grab the description, and push it into redis.
 * @param {string} filename Name of the file being processed
 * @param {Index} index The Index object that wraps Redis
 * @param {*} response Individual response from the Cloud Vision API
 * @returns {Promise<void>}
 */
async function extractDescriptions(filename, index, response) {
  if (response.textAnnotations.length) {
    const words = extractDescription(response.textAnnotations);
    await index.add(filename, words);
  } else {
    console.log(`${filename} had no discernable text.`);
    await index.setContainsNoText(filename);
  }
}

/**
 * Given a set of image file paths, extract the text and run them through the
 * Cloud Vision API.
 * @param {Index} index The stateful `Index` Object.
 * @param {string[]} inputFiles The list of files to process.
 * @returns {Promise<void>}
 */
async function getTextFromFiles(index, inputFiles) {
  // Read all of the given files and provide request objects that will be
  // passed to the Cloud Vision API in a batch request.
  const requests = await Promise.all(
    inputFiles.map(async filename => {
      const content = await fs.readFile(filename);
      console.log(` 👉 ${filename}`);
      return {
        image: {
          content: content.toString('base64'),
        },
        features: [{type: 'TEXT_DETECTION'}],
      };
    })
  );

  // Make a call to the Vision API to detect text
  const results = await client.batchAnnotateImages({requests});
  const detections = results[0].responses;
  await Promise.all(
    inputFiles.map(async (filename, i) => {
      const response = detections[i];
      if (response.error) {
        console.info(`API Error for ${filename}`, response.error);
        return;
      }
      await extractDescriptions(filename, index, response);
    })
  );
}

/**
 * Main entry point for the program.
 * @param {string} inputDir The directory in which to run the sample.
 * @returns {Promise<void>}
 */
async function main(inputDir) {
  const index = new Index();
  try {
    const files = await fs.readdir(inputDir);

    // Get a list of all files in the directory (filter out other directories)
    const allImageFiles = (
      await Promise.all(
        files.map(async file => {
          const filename = path.join(inputDir, file);
          const stats = await fs.stat(filename);
          if (!stats.isDirectory()) {
            return filename;
          }
        })
      )
    ).filter(f => !!f);

    // Figure out which files have already been processed
    let imageFilesToProcess = (
      await Promise.all(
        allImageFiles.map(async filename => {
          const processed = await index.documentIsProcessed(filename);
          if (!processed) {
            // Forward this filename on for further processing
            return filename;
          }
        })
      )
    ).filter(file => !!file);

    // The batch endpoint won't handle
    if (imageFilesToProcess.length > 15) {
      console.log(
        'Maximum of 15 images allowed. Analyzing the first 15 found.'
      );
      imageFilesToProcess = imageFilesToProcess.slice(0, 15);
    }

    // Analyze any remaining unprocessed files
    if (imageFilesToProcess.length > 0) {
      console.log('Files to process: ');
      await getTextFromFiles(index, imageFilesToProcess);
    }
    console.log('All files processed!');
  } catch (e) {
    console.error(e);
  }
  index.quit();
}

const usage =
  'Usage: node textDetection <command> <arg> ... \n\n  Commands: analyze, lookup';
if (process.argv.length < 3) {
  throw new Error(usage);
}
const args = process.argv.slice(2);
const command = args.shift();
if (command === 'analyze') {
  if (!args.length) {
    throw new Error('Usage: node textDetection analyze <dir>');
  }
  main(args[0]).catch(console.error);
} else if (command === 'lookup') {
  if (!args.length) {
    throw new Error('Usage: node textDetection lookup <word> ...');
  }
  lookup(args).catch(console.error);
} else {
  throw new Error(usage);
}
