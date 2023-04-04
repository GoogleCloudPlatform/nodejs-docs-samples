// Copyright 2018 Google LLC
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

const path = require('path');
const {assert} = require('chai');
const {describe, it, before} = require('mocha');
const fs = require('fs');
const cp = require('child_process');
const DLP = require('@google-cloud/dlp');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';
const surrogateType = 'SSN_TOKEN';
const csvFile = 'resources/dates.csv';
const tempOutputFile = path.join(__dirname, 'temp.result.csv');
const dateShiftAmount = 30;
const dateFields = 'birth_date,register_date';

const client = new DLP.DlpServiceClient();
describe('deid', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });
  // deidentify_masking
  it('should mask sensitive data in a string', () => {
    const output = execSync(
      `node deidentifyWithMask.js ${projectId} "${harmfulString}" x 5`
    );
    assert.include(output, 'My SSN is xxxxx9127');
  });

  it('should ignore insensitive data when masking a string', () => {
    const output = execSync(
      `node deidentifyWithMask.js ${projectId} "${harmlessString}"`
    );
    assert.include(output, harmlessString);
  });

  // deidentify_fpe
  it('should handle FPE encryption errors', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithFpe.js ${projectId} "${harmfulString}" '[0-9A-Za-z]' 'BAD_KEY_NAME' 'BAD_KEY_NAME'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'invalid encoding');
  });

  // reidentify_fpe
  it('should handle FPE decryption errors', () => {
    let output;
    try {
      output = execSync(
        `node reidentifyWithFpe.js ${projectId} "${harmfulString}" '[0-9A-Za-z]' ${surrogateType} 'BAD_KEY_NAME' 'BAD_KEY_NAME NUMERIC'`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'invalid encoding');
  });

  // deidentify_date_shift
  it('should date-shift a CSV file', () => {
    const outputCsvFile = 'dates.actual.csv';
    const output = execSync(
      `node deidentifyWithDateShift.js ${projectId} "${csvFile}" "${outputCsvFile}" ${dateFields} ${dateShiftAmount} ${dateShiftAmount}`
    );
    assert.include(
      output,
      `Successfully saved date-shift output to ${outputCsvFile}`
    );
    assert.notInclude(
      fs.readFileSync(outputCsvFile).toString(),
      fs.readFileSync(csvFile).toString()
    );
  });

  it('should handle date-shift errors', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithDateShift.js ${projectId} "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });
});
