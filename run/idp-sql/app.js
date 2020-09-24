// Copyright 2020 Google LLC
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

const admin = require('firebase-admin');
const express = require('express');
const { logger } = require('./logging');
const { getVotes, getVoteCount, insertVote } = require('./cloud-sql');

const app = express();
app.set('view engine', 'pug');
app.enable('trust proxy');
app.use(express.static(__dirname + '/static'));

// Automatically parse request body as form data.
app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Set Content-Type for all responses for these routes.
app.use((req, res, next) => {
  res.set('Content-Type', 'text/html');
  next();
});

// Initialize Firebase Admin SDK
admin.initializeApp();

// [START run_user_auth_jwt]
// Extract and verify Id Token from header
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    // If the provided ID token has the correct format, is not expired, and is
    // properly signed, the method returns the decoded ID token
    admin.auth().verifyIdToken(token).then(function(decodedToken) {
      let uid = decodedToken.uid;
      req.uid = uid;
      next();
    }).catch((err) => {
      return res.sendStatus(403);
    });
  } else {
    return res.sendStatus(401);
  }
}
// [END run_user_auth_jwt]


app.get('/', async (req, res) => {
  try {
    // Query the total count of "CATS" from the database.
    const catsResult = await getVoteCount('CATS');
    const catsTotalVotes = parseInt(catsResult[0].count);
    // Query the total count of "DOGS" from the database.
    const dogsResult = await getVoteCount('DOGS');
    const dogsTotalVotes = parseInt(dogsResult[0].count);
    // Query the last 5 votes from the database.
    const votes = await getVotes();
    // Calculate and set leader values.
    let leadTeam = '';
    let voteDiff = 0;
    let leaderMessage = '';
    if (catsTotalVotes !== dogsTotalVotes) {
      if (catsTotalVotes > dogsTotalVotes) {
        leadTeam = 'CATS';
        voteDiff = catsTotalVotes - dogsTotalVotes;
      } else {
        leadTeam = 'DOGS';
        voteDiff = dogsTotalVotes - catsTotalVotes;
      }
      leaderMessage = `${leadTeam} are winning by ${voteDiff} vote${voteDiff > 1 ? 's' : ''}.`;
    } else {
      leaderMessage = 'CATS and DOGS are evenly matched!';
    }
    res.render('index.pug', {
      votes: votes,
      catsCount: catsTotalVotes,
      dogsCount: dogsTotalVotes,
      leadTeam: leadTeam,
      voteDiff: voteDiff,
      leaderMessage: leaderMessage,
    });
  } catch(err) {
    logger.error(`Error while attempting to get vote: ${err}`);
    res
    .status(500)
    .send('Unable to load page; see logs for more details.')
    .end();
  }

});

app.post('/', authenticateJWT, async (req, res) => {
  // Get decoded Id Platform user id
  const uid = req.uid;
  // Get the team from the request and record the time of the vote.
  const {team} = req.body;
  const timestamp = new Date();

  if (!team || (team !== 'CATS' && team !== 'DOGS')) {
    res.status(400).send('Invalid team specified.').end();
    return;
  }

  // Create a vote record to be stored in the database.
  const vote = {
    candidate: team,
    time_cast: timestamp,
    uid,
  };

  // Save the data to the database.
  try {
    await insertVote(vote);
    logger.info({message: 'vote_inserted', vote})
  } catch (err) {
    logger.error(`Error while attempting to submit vote: ${err}`);
    res
    .status(500)
    .send('Unable to cast vote; see logs for more details.')
    .end();
    return;
  }
  res.status(200).send(`Successfully voted for ${team} at ${timestamp}`).end();
});

module.exports = {app};
