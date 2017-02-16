/**
 * Copyright 2017, Google, Inc.
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

require(`../../system-test/_setup`);

const cmd = 'node redact';

// redact_string
test(`should redact sensitive data from a string`, async (t) => {
  const output = await runAsync(`${cmd} string "I am Gary and my phone number is (123) 456-7890." REDACTED -t US_MALE_NAME PHONE_NUMBER`);
  t.is(output, 'I am REDACTED and my phone number is REDACTED.');
});

test(`should ignore unspecified type names when redacting from a string`, async (t) => {
  const output = await runAsync(`${cmd} string "I am Gary and my phone number is (123) 456-7890." REDACTED -t PHONE_NUMBER`);
  t.is(output, 'I am Gary and my phone number is REDACTED.');
});

test(`should report string redaction handling errors`, async (t) => {
  const output = await runAsync(`${cmd} string "My name is Gary and my phone number is (123) 456-7890." REDACTED -t PHONE_NUMBER -a foo`);
  t.regex(output, /Error in redactString/);
});

// CLI options
test(`should have a minLikelihood option`, async (t) => {
  const promiseA = runAsync(`${cmd} string "My phone number is (123) 456-7890." REDACTED -t PHONE_NUMBER -m VERY_LIKELY`);
  const promiseB = runAsync(`${cmd} string "My phone number is (123) 456-7890." REDACTED -t PHONE_NUMBER -m UNLIKELY`);

  const outputA = await promiseA;
  t.is(outputA, 'My phone number is (123) 456-7890.');

  const outputB = await promiseB;
  t.is(outputB, 'My phone number is REDACTED.');
});

test(`should have an option for custom auth tokens`, async (t) => {
  const output = await runAsync(`${cmd} string "My name is Gary and my phone number is (123) 456-7890." REDACTED -t PHONE_NUMBER -a foo`);
  t.regex(output, /Error in redactString/);
  t.regex(output, /invalid authentication/);
});
