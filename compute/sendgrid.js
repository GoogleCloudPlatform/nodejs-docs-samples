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
// This sample is based off of https://www.npmjs.com/package/sendgrid#without-mail-helper-class
const Sendgrid = require('sendgrid')(
  process.env.SENDGRID_API_KEY || '<your-sendgrid-api-key>'
);

async function sendgrid() {
  const request = Sendgrid.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: {
      personalizations: [
        {
          to: [{email: 'to_email@example.com'}],
          subject: 'Sendgrid test email from Node.js on Google Cloud Platform',
        },
      ],
      from: {email: 'from_email@example.com'},
      content: [
        {
          type: 'text/plain',
          value:
            'Hello!\n\nThis a Sendgrid test email from Node.js on Google Cloud Platform.',
        },
      ],
    },
  });

  const response = await Sendgrid.API(request);
  console.log(response);
}
sendgrid().catch(console.error);

// [END send]
