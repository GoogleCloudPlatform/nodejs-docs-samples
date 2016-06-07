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

var gcloud = require('gcloud');

// Create a datastore client.
var datastore = gcloud.datastore();

// Gets a Datastore key from the kind/key pair in the request
function _getKeyFromData (data, callback) {
  var key = data.key;
  var kind = data.kind;

  if (!key) {
    return callback('Key not provided. Make sure you have a "key" property ' +
      'in your request');
  }

  if (!kind) {
    return callback('Kind not provided. Make sure you have a "kind" property ' +
      'in your request');
  }

  return callback(null, datastore.key([kind, key]));
}

// Gets a Datastore entity based on the key information in the request and
// returns null if the entity does not exist
function _getEntity (data, callback) {
  return _getKeyFromData(data, function (err, k) {
    if (err) {
      return callback(err);
    }

    return datastore.get(k, function (err, entity) {
      if (err) {
        return callback(err);
      }
      return callback(null, k, entity || null);
    });
  });
}

// Saves (creates or inserts) an entity with the given key
function _saveEntity (key, entity, callback) {
  return datastore.save({
    key: key,
    data: entity
  }, callback);
}

/**
 * Creates and/or updates a record
 */
function set (context, data) {
  // The value contains a JSON document representing the entity we want to save
  var value = data.value;

  if (!value) {
    return context.failure('Value not provided. Make sure you have a "value" ' +
      'property in your request');
  }

  _getKeyFromData(data, function (err, k) {
    if (err) {
      console.error(err);
      return context.failure(err);
    }

    _saveEntity(k, value, function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }

      return context.success('Entity saved');
    });
  });
}

/**
 * Retrieves a record
 */
function get (context, data) {
  return _getEntity(data, function (err, key, entity) {
    if (err) {
      console.error(err);
      return context.failure(err);
    }

    // The get operation will not fail for a non-existent entity, it just returns null.
    if (!entity) {
      return context.failure('No entity found for key ' + key.path);
    }

    return context.success(entity);
  });
}

/**
 * Deletes a record
 */
function del (context, data) {
  return _getKeyFromData(data, function (err, k) {
    if (err) {
      console.error(err);
      return context.failure(err);
    }

    datastore.delete(k, function (err) {
      if (err) {
        console.error(err);
        return context.failure(err);
      }

      return context.success('Entity deleted');
    });
  });
}

exports.set = set;
exports.get = get;
exports.del = del;
