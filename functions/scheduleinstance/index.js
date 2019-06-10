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

// [START functions_start_instance_pubsub]
// [START functions_stop_instance_pubsub]
const {Buffer} = require('safe-buffer');
const Compute = require('@google-cloud/compute');
const compute = new Compute();
// [END functions_stop_instance_pubsub]

/**
 * Starts a Compute Engine instance.
 *
 * Expects a PubSub message with JSON-formatted event data containing the
 * following attributes:
 *  zone - the GCP zone the instances are located in.
 *  label - the label of instances to start.
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating
 *  completion.
 */
exports.startInstancePubSub = (event, context, callback) => {
  try {
    const payload = _validatePayload(
      JSON.parse(Buffer.from(event.data, 'base64').toString())
    );
    const options = {filter: `labels.${payload.label}`};
    compute.getVMs(options).then(vms => {
      vms[0].forEach(instance => {
        if (payload.zone === instance.zone.id) {
          compute
            .zone(payload.zone)
            .vm(instance.name)
            .start()
            .then(data => {
              // Operation pending.
              const operation = data[0];
              return operation.promise();
            })
            .then(() => {
              // Operation complete. Instance successfully started.
              const message = 'Successfully started instance ' + instance.name;
              console.log(message);
              callback(null, message);
            })
            .catch(err => {
              console.log(err);
              callback(err);
            });
        }
      });
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
 *  zone - the GCP zone the instances are located in.
 *  instance - the name of a single instance.
 *  label - the label of instances to start.
 *
 * Exactly one of instance or label must be specified.
 *
 * @param {!object} event Cloud Function PubSub message event.
 * @param {!object} callback Cloud Function PubSub callback indicating completion.
 */
exports.stopInstancePubSub = (event, context, callback) => {
  try {
    const payload = _validatePayload(
      JSON.parse(Buffer.from(event.data, 'base64').toString())
    );
    const options = {filter: `labels.${payload.label}`};
    compute.getVMs(options).then(vms => {
      vms[0].forEach(instance => {
        if (payload.zone === instance.zone.id) {
          compute
            .zone(payload.zone)
            .vm(instance.name)
            .stop()
            .then(data => {
              // Operation pending.
              const operation = data[0];
              return operation.promise();
            })
            .then(() => {
              // Operation complete. Instance successfully stopped.
              const message = 'Successfully stopped instance ' + instance.name;
              console.log(message);
              callback(null, message);
            })
            .catch(err => {
              console.log(err);
              callback(err);
            });
        }
      });
    });
  } catch (err) {
    console.log(err);
    callback(err);
  }
};
// [START functions_start_instance_pubsub]

/**
 * Validates that a request payload contains the expected fields.
 *
 * @param {!object} payload the request payload to validate.
 * @return {!object} the payload object.
 */
function _validatePayload(payload) {
  if (!payload.zone) {
    throw new Error(`Attribute 'zone' missing from payload`);
  } else if (!payload.label) {
    throw new Error(`Attribute 'label' missing from payload`);
  }
  return payload;
}
// [END functions_start_instance_pubsub]
// [END functions_stop_instance_pubsub]
