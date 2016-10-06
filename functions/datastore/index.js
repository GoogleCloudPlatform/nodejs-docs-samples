// Copyright 2016, Google, Inc.
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

const Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
const datastore = Datastore();

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {object} requestData Cloud Function request data.
 * @param {string} requestData.key Datastore key string.
 * @param {string} requestData.kind Datastore kind.
 * @returns {object} Datastore key object.
 */
function getKeyFromRequestData (requestData) {
  if (!requestData.key) {
    throw new Error('Key not provided. Make sure you have a "key" property ' +
      'in your request');
  }

  if (!requestData.kind) {
    throw new Error('Kind not provided. Make sure you have a "kind" property ' +
      'in your request');
  }

  return datastore.key([requestData.kind, requestData.key]);
}

/**
 * Creates and/or updates a record.
 *
 * @example
 * gcloud alpha functions call ds-set --data '{"kind":"gcf-test","key":"foobar","value":{"message": "Hello World!"}}'
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload, in this case provided by the user.
 * @param {string} event.payload.kind The Datastore kind of the data to save, e.g. "user".
 * @param {string} event.payload.key Key at which to save the data, e.g. 5075192766267392.
 * @param {object} event.payload.value Value to save to Cloud Datastore, e.g. {"name":"John"}
 * @param {function} The callback function.
 */
function set (event, callback) {
  try {
    // The value contains a JSON document representing the entity we want to save
    if (!event.payload.value) {
      throw new Error('Value not provided. Make sure you have a "value" ' +
        'property in your request');
    }

    const key = getKeyFromRequestData(event.payload);

    datastore.save({
      key: key,
      data: event.payload.value
    }, (err) => {
      if (err) {
        console.error(err);
        callback(err);
        return;
      }

      callback(null, 'Entity saved');
    });
  } catch (err) {
    console.error(err);
    callback(err);
  }
}

/**
 * Retrieves a record.
 *
 * @example
 * gcloud alpha functions call ds-get --data '{"kind":"gcf-test","key":"foobar"}'
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload, in this case provided by the user.
 * @param {string} event.payload.kind The Datastore kind of the data to retrieve, e.g. "user".
 * @param {string} event.payload.key Key at which to retrieve the data, e.g. 5075192766267392.
 * @param {function} The callback function.
 */
function get (event, callback) {
  try {
    const key = getKeyFromRequestData(data);

    datastore.get(key, (err, entity) => {
      if (err) {
        console.error(err);
        callback(err);
        return;
      }

      // The get operation will not fail for a non-existent entity, it just
      // returns null.
      if (!entity) {
        callback(new Error('No entity found for key ' + key.path));
        return;
      }

      callback(null, entity);
    });
  } catch (err) {
    console.error(err);
    callback(err);
  }
}

/**
 * Deletes a record.
 *
 * @example
 * gcloud alpha functions call ds-del --data '{"kind":"gcf-test","key":"foobar"}'
 *
 * @param {object} event The Cloud Functions event.
 * @param {object} event.payload The event payload, in this case provided by the user.
 * @param {string} event.payload.kind The Datastore kind of the data to delete, e.g. "user".
 * @param {string} event.payload.key Key at which to delete data, e.g. 5075192766267392.
 * @param {function} The callback function.
 */
function del (event, callback) {
  try {
    const key = getKeyFromRequestData(data);

    datastore.delete(key, (err) => {
      if (err) {
        console.error(err);
        callback(err);
        return;
      }

      callback(null, 'Entity deleted');
    });
  } catch (err) {
    console.error(err);
    callback(err);
  }
}

exports.set = set;
exports.get = get;
exports.del = del;
