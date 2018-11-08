/**
 * Copyright 2018, Google, Inc.
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

// [START functions_start_instance_http]
// [START functions_stop_instance_http]
// [START functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]
const Buffer = require('safe-buffer').Buffer;
const Compute = require('@google-cloud/compute');
const compute = new Compute();

// [END functions_stop_instance_http]
// [END functions_start_instance_pubsub]
// [END functions_stop_instance_pubsub]
/**
 * Starts a Compute Engine instance.
 *
 * Expects an HTTP POST request with a JSON-formatted request body containing
 * the following attributes:
 *  zone - the GCP zone the instance is located in.
 *  instance - the name of the instance.
 *
 * @param {!object} req Cloud Function HTTP request data.
 * @param {!object} res Cloud Function HTTP response data.
 * @returns {!object} Cloud Function response data with status code and message.
 */
exports.startInstanceHttp = (req, res) => {
  try {
    const payload = _validatePayload(_parseHttpPayload(_validateHttpReq(req)));
    compute.zone(payload.zone)
      .vm(payload.instance)
      .start()
      .then(data => {
        // Operation pending.
        const operation = data[0];
        return operation.promise();
      })
      .then(() => {
        // Operation complete. Instance successfully started.
        const message = 'Successfully started instance ' + payload.instance;
        console.log(message);
        res.status(200).send(message);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({error: err.message});
      });
  } catch (err) {
    console.log(err);
    res.status(400).send({error: err.message});
  }
  return res;
};

// [END functions_start_instance_http]
// [START functions_stop_instance_http]
/**
 * Stops a Compute Engine instance.
 *
 * Expects an HTTP POST request with a JSON-formatted request body containing
 * the following attributes:
 *  zone - the GCP zone the instance is located in.
 *  instance - the name of the instance.
 *
 * @param {!object} req Cloud Function HTTP request data.
 * @param {!object} res Cloud Function HTTP response data.
 * @returns {!object} Cloud Function response data with status code and message.
 */
exports.stopInstanceHttp = (req, res) => {
  try {
    const payload = _validatePayload(_parseHttpPayload(_validateHttpReq(req)));
    compute.zone(payload.zone)
      .vm(payload.instance)
      .stop()
      .then(data => {
        // Operation pending.
        const operation = data[0];
        return operation.promise();
      })
      .then(() => {
        // Operation complete. Instance successfully stopped.
        const message = 'Successfully stopped instance ' + payload.instance;
        console.log(message);
        res.status(200).send(message);
      })
      .catch(err => {
        console.log(err);
        res.status(500).send({error: err.message});
      });
  } catch (err) {
    console.log(err);
    res.status(400).send({error: err.message});
  }
  return res;
};

// [END functions_stop_instance_http]
// [START functions_start_instance_pubsub]
/**
 * Starts a Compute Engine instance.
 *
 * Expects a PubSub message with JSON-formatted event data containing the
 * following attributes:
 *  zone - the GCP zone the instance is located in.
 *  instance - the name of the instance.
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating completion.
 */
exports.startInstancePubSub = (event, callback) => {
  try {
    const pubsubMessage = event.data;
    const payload = _validatePayload(JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString()));
    compute.zone(payload.zone)
      .vm(payload.instance)
      .start()
      .then(data => {
        // Operation pending.
        const operation = data[0];
        return operation.promise();
      })
      .then(() => {
        // Operation complete. Instance successfully started.
        const message = 'Successfully started instance ' + payload.instance;
        console.log(message);
        callback(null, message);
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  } catch (err) {
    console.log(err);
    callback(err);
  }
};

// [END functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]
/**
 * Stops a Compute Engine instance.
 *
 * Expects a PubSub message with JSON-formatted event data containing the
 * following attributes:
 *  zone - the GCP zone the instance is located in.
 *  instance - the name of the instance.
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating completion.
 */
exports.stopInstancePubSub = (event, callback) => {
  try {
    const pubsubMessage = event.data;
    const payload = _validatePayload(JSON.parse(Buffer.from(pubsubMessage.data, 'base64').toString()));
    compute.zone(payload.zone)
      .vm(payload.instance)
      .stop()
      .then(data => {
        // Operation pending.
        const operation = data[0];
        return operation.promise();
      })
      .then(() => {
        // Operation complete. Instance successfully stopped.
        const message = 'Successfully stopped instance ' + payload.instance;
        console.log(message);
        callback(null, message);
      })
      .catch(err => {
        console.log(err);
        callback(err);
      });
  } catch (err) {
    console.log(err);
    callback(err);
  }
};

// [START functions_start_instance_http]
// [START functions_stop_instance_http]
// [START functions_start_instance_pubsub]
/**
 * Validates that a request payload contains the expected fields.
 *
 * @param {!object} payload the request payload to validate.
 * @returns {!object} the payload object.
 */
function _validatePayload (payload) {
  if (!payload.zone) {
    throw new Error(`Attribute 'zone' missing from payload`);
  } else if (!payload.instance) {
    throw new Error(`Attribute 'instance' missing from payload`);
  }
  return payload;
}
// [END functions_start_instance_pubsub]
// [END functions_stop_instance_pubsub]

/**
 * Parses the request payload of an HTTP request based on content-type.
 *
 * @param {!object} req a Cloud Functions HTTP request object.
 * @returns {!object} an object with attributes matching the request payload.
 */
function _parseHttpPayload (req) {
  const contentType = req.get('content-type');
  if (contentType === 'application/json') {
    // Request.body automatically parsed as an object.
    return req.body;
  } else if (contentType === 'application/octet-stream') {
    // Convert buffer to a string and parse as JSON string.
    return JSON.parse(req.body.toString());
  } else {
    throw new Error('Unsupported HTTP content-type ' + req.get('content-type') +
        '; use application/json or application/octet-stream');
  }
}

/**
 * Validates that a HTTP request contains the expected fields.
 *
 * @param {!object} req the request to validate.
 * @returns {!object} the request object.
 */
function _validateHttpReq (req) {
  if (req.method !== 'POST') {
    throw new Error('Unsupported HTTP method ' + req.method +
        '; use method POST');
  } else if (typeof req.get('content-type') === 'undefined') {
    throw new Error('HTTP content-type missing');
  }
  return req;
}
// [END functions_start_instance_http]
// [END functions_stop_instance_http]
