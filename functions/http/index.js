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

// [START functions_http_helloworld]
/**
 * Responds to any HTTP request that can provide a "message" field in the body.
 *
 * @param {Object} req Cloud Function request context.
 * @param {Object} res Cloud Function response context.
 */
exports.helloWorld = (req, res) => {
  if (req.body.message === undefined) {
    // This is an error case, as "message" is required
    res.status(400).send('No message defined!');
  } else {
    // Everything is ok
    console.log(req.body.message);
    res.status(200).end();
  }
};
// [END functions_http_helloworld]

// [START functions_http_content]
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

  res.status(200).send(`Hello ${name || 'World'}!`);
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
      res.status(500).send({ error: 'Something blew up!' });
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

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename) => {
      // Note: os.tmpdir() points to an in-memory file system on GCF
      // Thus, any files in it must fit in the instance's memory.
      console.log(`Processed file ${filename}`);
      const filepath = path.join(tmpdir, filename);
      uploads[fieldname] = filepath;
      file.pipe(fs.createWriteStream(filepath));
    });

    // This event will be triggered after all uploaded files are saved.
    busboy.on('finish', () => {
      // TODO(developer): Process uploaded files here
      for (const name in uploads) {
        const file = uploads[name];
        fs.unlinkSync(file);
      }
      res.send();
    });

    req.pipe(busboy);
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
