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

var Datastore = require('@google-cloud/datastore');

// Instantiate a datastore client
var datastore = Datastore();

/**
 * Gets a Datastore key from the kind/key pair in the request.
 *
 * @param {Object} requestData Cloud Function request data.
 * @param {string} requestData.key Datastore key string.
 * @param {string} requestData.kind Datastore kind.
 * @returns {Object} Datastore key object.
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
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the user.
 * @param {string} data.kind The Datastore kind of the data to save, e.g. "user".
 * @param {string} data.key Key at which to save the data, e.g. 5075192766267392.
 * @param {Object} data.value Value to save to Cloud Datastore, e.g. {"name":"John"}
 */
function set (context, data) {
  try {
    // The value contains a JSON document representing the entity we want to save
    if (!data.value) {
      throw new Error('Value not provided. Make sure you have a "value" ' +
        'property in your request');
    }

    var key = getKeyFromRequestData(data);

    return datastore.save({
      key: key,
      data: data.value
    }, function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }

      return context.success('Entity saved');
    });
  } catch (err) {
    console.error(err);
    return context.failure(err.message);
  }
}

/**
 * Retrieves a record.
 *
 * @example
 * gcloud alpha functions call ds-get --data '{"kind":"gcf-test","key":"foobar"}'
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the user.
 * @param {string} data.kind The Datastore kind of the data to retrieve, e.g. "user".
 * @param {string} data.key Key at which to retrieve the data, e.g. 5075192766267392.
 */
function get (context, data) {
  try {
    var key = getKeyFromRequestData(data);

    return datastore.get(key, function (err, entity) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }

      // The get operation will not fail for a non-existent entity, it just
      // returns null.
      if (!entity) {
        return context.failure('No entity found for key ' + key.path);
      }

      return context.success(entity);
    });
  } catch (err) {
    console.error(err);
    return context.failure(err.message);
  }
}

/**
 * Deletes a record.
 *
 * @example
 * gcloud alpha functions call ds-del --data '{"kind":"gcf-test","key":"foobar"}'
 *
 * @param {Object} context Cloud Function context.
 * @param {Function} context.success Success callback.
 * @param {Function} context.failure Failure callback.
 * @param {Object} data Request data, in this case an object provided by the user.
 * @param {string} data.kind The Datastore kind of the data to delete, e.g. "user".
 * @param {string} data.key Key at which to delete data, e.g. 5075192766267392.
 */
function del (context, data) {
  try {
    var key = getKeyFromRequestData(data);

    return datastore.delete(key, function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }

      return context.success('Entity deleted');
    });
  } catch (err) {
    console.error(err);
    return context.failure(err.message);
  }
}

exports.set = set;
exports.get = get;
exports.del = del;
