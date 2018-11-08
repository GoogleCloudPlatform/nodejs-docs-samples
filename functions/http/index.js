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

// [START functions_http_content]
const escapeHtml = require('escape-html');

/**
 * Responds to an HTTP request using data from the request body parsed according
 * to the "content-type" header.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloContent = (req, res) => {
  let name;

  switch (req.get('content-type')) {
    // '{"name":"John"}'
    case 'application/json':
      name = req.body.name;
      break;

    // 'John', stored in a Buffer
    case 'application/octet-stream':
      name = req.body.toString(); // Convert buffer to a string
      break;

    // 'John'
    case 'text/plain':
      name = req.body;
      break;

    // 'name=John' in the body of a POST request (not the URL)
    case 'application/x-www-form-urlencoded':
      name = req.body.name;
      break;
  }

  res.status(200).send(`Hello ${escapeHtml(name || 'World')}!`);
};
// [END functions_http_content]

// [START functions_http_method]
function handleGET (req, res) {
  // Do something with the GET request
  res.status(200).send('Hello World!');
}

function handlePUT (req, res) {
  // Do something with the PUT request
  res.status(403).send('Forbidden!');
}

/**
 * Responds to a GET request with "Hello World!". Forbids a PUT request.
 *
 * @example
 * gcloud alpha functions call helloHttp
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloHttp = (req, res) => {
  switch (req.method) {
    case 'GET':
      handleGET(req, res);
      break;
    case 'PUT':
      handlePUT(req, res);
      break;
    default:
      res.status(405).send({ error: 'Something blew up!' });
      break;
  }
};
// [END functions_http_method]

// [START functions_http_xml]
/**
 * Parses a document of type 'text/xml'
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.parseXML = (req, res) => {
  // Convert the request to a Buffer and a string
  // Use whichever one is accepted by your XML parser
  let data = req.rawBody;
  let xmlData = data.toString();

  const parseString = require('xml2js').parseString;

  parseString(xmlData, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).end();
      return;
    }
    res.send(result);
  });
};
// [END functions_http_xml]

// [START functions_http_form_data]
/**
 * Parses a 'multipart/form-data' upload request
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
const path = require('path');
const os = require('os');
const fs = require('fs');

// Node.js doesn't have a built-in multipart/form-data parsing library.
// Instead, we can use the 'busboy' library from NPM to parse these requests.
const Busboy = require('busboy');

exports.uploadFile = (req, res) => {
  if (req.method === 'POST') {
    const busboy = new Busboy({ headers: req.headers });
    const tmpdir = os.tmpdir();

    // This object will accumulate all the fields, keyed by their name
    const fields = {};

    // This object will accumulate all the uploaded files, keyed by their name.
    const uploads = {};

    // This code will process each non-file field in the form.
    busboy.on('field', (fieldname, val) => {
      // TODO(developer): Process submitted field values here
      console.log(`Processed field ${fieldname}: ${val}.`);
      fields[fieldname] = val;
    });

    let fileWrites = [];

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename) => {
      // Note: os.tmpdir() points to an in-memory file system on GCF
      // Thus, any files in it must fit in the instance's memory.
      console.log(`Processed file ${filename}`);
      const filepath = path.join(tmpdir, filename);
      uploads[fieldname] = filepath;

      const writeStream = fs.createWriteStream(filepath);
      file.pipe(writeStream);

      // File was processed by Busboy; wait for it to be written to disk.
      const promise = new Promise((resolve, reject) => {
        file.on('end', () => {
          writeStream.end();
        });
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
      });
      fileWrites.push(promise);
    });

    // Triggered once all uploaded files are processed by Busboy.
    // We still need to wait for the disk writes (saves) to complete.
    busboy.on('finish', () => {
      Promise.all(fileWrites)
        .then(() => {
          // TODO(developer): Process saved files here
          for (const name in uploads) {
            const file = uploads[name];
            fs.unlinkSync(file);
          }
          res.send();
        });
    });

    busboy.end(req.rawBody);
  } else {
    // Return a "method not allowed" error
    res.status(405).end();
  }
};
// [END functions_http_form_data]

// [START functions_http_signed_url]
const storage = require('@google-cloud/storage')();

/**
 * HTTP function that generates a signed URL
 * The signed URL can be used to upload files to Google Cloud Storage (GCS)
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.getSignedUrl = (req, res) => {
  if (req.method === 'POST') {
    // TODO(developer) check that the user is authorized to upload

    // Get a reference to the destination file in GCS
    const file = storage.bucket('my-bucket').file(req.body.filename);

    // Create a temporary upload URL
    const expiresAtMs = Date.now() + 300000; // Link expires in 5 minutes
    const config = {
      action: 'write',
      expires: expiresAtMs,
      contentType: req.body.contentType
    };

    file.getSignedUrl(config, function (err, url) {
      if (err) {
        console.error(err);
        res.status(500).end();
        return;
      }
      res.send(url);
    });
  } else {
    // Return a "method not allowed" error
    res.status(405).end();
  }
};
// [END functions_http_signed_url]

// [START functions_http_cors]
/**
 * HTTP function that supports CORS requests.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.corsEnabledFunction = (req, res) => {
  // Set CORS headers for preflight requests
  // Allows GETs from any origin with the Content-Type header
  // and caches preflight response for 3600s

  res.set('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    // Set CORS headers for the main request
    res.set('Access-Control-Allow-Origin', '*');
    res.send('Hello World!');
  }
};
// [END functions_http_cors]

// [START functions_http_cors_auth]
/**
 * HTTP function that supports CORS requests with credentials.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.corsEnabledFunctionAuth = (req, res) => {
  // Set CORS headers for preflight requests
  // Allows GETs from origin https://mydomain.com with Authorization header

  res.set('Access-Control-Allow-Origin', 'https://mydomain.com');
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'GET');
    res.set('Access-Control-Allow-Headers', 'Authorization');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204).send('');
  } else {
    res.send('Hello World!');
  }
};
// [END functions_http_cors_auth]
