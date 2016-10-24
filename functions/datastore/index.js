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

const Datastore = require('@google-cloud/datastore');

// Instantiates a client
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
    throw new Error('Key not provided. Make sure you have a "key" property in your request');
  }

  if (!requestData.kind) {
    throw new Error('Kind not provided. Make sure you have a "kind" property in your request');
  }

  return datastore.key([requestData.kind, requestData.key]);
}

/**
 * Creates and/or updates a record.
 *
 * @example
 * gcloud alpha functions call set --data '{"kind":"Task","key":"sampletask1","value":{"description": "Buy milk"}}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to save, e.g. "Task".
 * @param {string} req.body.key Key at which to save the data, e.g. "sampletask1".
 * @param {object} req.body.value Value to save to Cloud Datastore, e.g. {"description":"Buy milk"}
 * @param {object} res Cloud Function response context.
 */
exports.set = function set (req, res) {
  // The value contains a JSON document representing the entity we want to save
  if (!req.body.value) {
    throw new Error('Value not provided. Make sure you have a "value" property in your request');
  }

  const key = getKeyFromRequestData(req.body);
  const entity = {
    key: key,
    data: req.body.value
  };

  return datastore.save(entity)
    .then(() => res.status(200).send(`Entity ${key.path.join('/')} saved.`))
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
};

/**
 * Retrieves a record.
 *
 * @example
 * gcloud alpha functions call get --data '{"kind":"Task","key":"sampletask1"}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to retrieve, e.g. "Task".
 * @param {string} req.body.key Key at which to retrieve the data, e.g. "sampletask1".
 * @param {object} res Cloud Function response context.
 */
exports.get = function get (req, res) {
  const key = getKeyFromRequestData(req.body);

  return datastore.get(key)
    .then(([entity]) => {
      // The get operation will not fail for a non-existent entity, it just
      // returns null.
      if (!entity) {
        throw new Error(`No entity found for key ${key.path.join('/')}.`);
      }

      res.status(200).send(entity);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
};

/**
 * Deletes a record.
 *
 * @example
 * gcloud alpha functions call del --data '{"kind":"Task","key":"sampletask1"}'
 *
 * @param {object} req Cloud Function request context.
 * @param {object} req.body The request body.
 * @param {string} req.body.kind The Datastore kind of the data to delete, e.g. "Task".
 * @param {string} req.body.key Key at which to delete data, e.g. "sampletask1".
 * @param {object} res Cloud Function response context.
 */
exports.del = function del (req, res) {
  const key = getKeyFromRequestData(req.body);

  // Deletes the entity
  return datastore.delete(key)
    .then(() => res.status(200).send(`Entity ${key.path.join('/')} deleted.`))
    .catch((err) => {
      console.error(err);
      res.status(500).send(err);
    });
};
