/**
 * Copyright 2018 Google LLC.
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

const Knex = require('knex');
const prompt = require('prompt');

const FIELDS = ['user', 'password', 'database'];

prompt.start();

// Prompt the user for connection details
prompt.get(FIELDS, (err, config) => {
  if (err) {
    console.error(err);
    return;
  }

  // Connect to the database
  const knex = Knex({client: 'pg', connection: config});

  // Create the "votes" table
  knex.schema
    .createTable('votes', table => {
      table.bigIncrements('vote_id').notNull();
      table.timestamp('time_cast').notNull();
      table.specificType('candidate', 'CHAR(6) NOT NULL');
    })
    .then(() => {
      console.log(`Successfully created 'votes' table.`);
      return knex.destroy();
    })
    .catch(err => {
      console.error(`Failed to create 'votes' table:`, err);
      if (knex) {
        knex.destroy();
      }
    });
});
