// Copyright 2023 Google LLC
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

const {Request, TYPES} = require('tedious');

// Promisifies the callback-based Tedious connect API
const connect = connection => () =>
  new Promise((res, rej) => {
    connection.connect(err => {
      if (err) {
        return rej(err);
      }
      res();
    });
  });

// Helper to execute SQL queries using the Tedious.Request API
const query = connection => (value, inputs) =>
  new Promise((res, rej) => {
    let error = false;
    const result = [];

    // Initialized callback-based Tedious Request API
    const req = new Request(value, err => {
      if (err) {
        rej(err);
        error = true;
      }
    });

    // if original Request callback API failed, skip
    if (error) {
      return;
    }

    // set error, progress and completion listeners in a way that is
    // easy to dereference them all once the query resolves
    const errorListener = err => {
      cleanListeners();
      rej(err);
    };
    const progressListener = columns => {
      result.push(columns);
    };
    const successListener = () => {
      cleanListeners();
      res(result);
    };
    const cleanListeners = () => {
      req
        .off('error', errorListener)
        .off('row', progressListener)
        .off('requestCompleted', successListener);
    };
    req
      .on('error', errorListener)
      .on('row', progressListener)
      .on('requestCompleted', successListener);

    // Optionally add parameters to queries that are defining input
    if (inputs && inputs.length) {
      for (const input of inputs) {
        const [name, type, value] = input;
        req.addParameter(name, type, value);
      }
    }

    // executes the query
    try {
      connection.execSql(req);
    } catch (err) {
      cleanListeners();
      return rej(err);
    }
  });

// Returns a helper object that has a connect and a query method,
// abstracting the verbose internal logic for interacting
// with the Tedious driver APIs.
const getTediousHelper = conn => ({
  connect: connect(conn),
  query: query(conn),
  TYPES,
});

module.exports = getTediousHelper;
