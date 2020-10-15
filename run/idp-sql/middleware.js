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

const { logger } = require('./logging'); // Import winston logger instance

// [START run_user_auth_jwt]
const firebase = require('firebase-admin');
// Initialize Firebase Admin SDK
firebase.initializeApp();

// Extract and verify Id Token from header
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    // If the provided ID token has the correct format, is not expired, and is
    // properly signed, the method returns the decoded ID token
    firebase.auth().verifyIdToken(token).then(function(decodedToken) {
      let uid = decodedToken.uid;
      req.uid = uid;
      next();
    }).catch((err) => {
      logger.error({message: `Error with authentication: ${err}`, traceId: req.traceId});
      return res.sendStatus(403);
    });
  } else {
    return res.sendStatus(401);
  }
}
// [END run_user_auth_jwt]

// Extract trace Id from trace header for log correlation
const getTrace = (req, res, next) => {
  const traceHeader = req.header('X-Cloud-Trace-Context');
  if (traceHeader) {
    const [trace] = traceHeader.split("/");
    req.traceId = trace;
  }
  next();
}

module.exports = {
  authenticateJWT,
  getTrace,
}
