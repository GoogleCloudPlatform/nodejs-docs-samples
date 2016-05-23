// Copyright 2015-2016, Google, Inc.
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

// [START send]
var Sendgrid = require('sendgrid')(
  process.env.SENDGRID_API_KEY || '<your-sendgrid-api-key>'
);

Sendgrid.send({
  from: 'ANOTHER_EMAIL@ANOTHER_EXAMPLE.COM', // From address
  to: 'EMAIL@EXAMPLE.COM', // To address
  subject: 'test email from Node.js on Google Cloud Platform', // Subject
  text: 'Hello!\n\nThis a test email from Node.js.' // Content
}, function (err, json) {
  if (err) {
    return console.log(err);
  }
  console.log(json);
});
// [END send]
