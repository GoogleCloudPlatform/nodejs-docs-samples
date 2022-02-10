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

const express = require('express');
const memjs = require('memjs');

const app = express();

// [START gae_flex_redislabs_memcache]
// Environment variables are defined in app.yaml.
const {MEMCACHE_URL} = process.env;

const mc = memjs.Client.create(MEMCACHE_URL);
// [END gae_flex_redislabs_memcache]

app.get('/', async (req, res, next) => {
  try {
    const {value} = await mc.get('foo');
    if (value) {
      res.status(200).send(`Value: ${value.toString('utf-8')}`);
      return;
    }

    await mc.set('foo', `${Math.random()}`, {});
    res.redirect('/');
  } catch (err) {
    next(err);
    return;
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});

module.exports = server;
