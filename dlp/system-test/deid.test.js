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
const fs = require('fs');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node deid.js';
const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';
const surrogateType = 'SSN_TOKEN';
const csvFile = 'resources/dates.csv';
const tempOutputFile = path.join(__dirname, 'temp.result.csv');
const dateShiftAmount = 30;
const dateFields = 'birth_date register_date';

describe('deid', () => {
  // deidentify_masking
  it('should mask sensitive data in a string', () => {
    const output = execSync(`${cmd} deidMask "${harmfulString}" -m x -n 5`);
    assert.include(output, 'My SSN is xxxxx9127');
  });

  it('should ignore insensitive data when masking a string', () => {
    const output = execSync(`${cmd} deidMask "${harmlessString}"`);
    assert.include(output, harmlessString);
  });

  it('should handle masking errors', () => {
    const output = execSync(`${cmd} deidMask "${harmfulString}" -n -1`);
    assert.include(output, 'Error in deidentifyWithMask');
  });

  // deidentify_fpe
  it('should handle FPE encryption errors', () => {
    const output = execSync(
      `${cmd} deidFpe "${harmfulString}" BAD_KEY_NAME BAD_KEY_NAME`
    );
    assert.match(output, /Error in deidentifyWithFpe/);
  });

  // reidentify_fpe
  it('should handle FPE decryption errors', () => {
    const output = execSync(
      `${cmd} reidFpe "${harmfulString}" ${surrogateType} BAD_KEY_NAME BAD_KEY_NAME -a NUMERIC`
    );
    assert.match(output, /Error in reidentifyWithFpe/);
  });

  // deidentify_date_shift
  it('should date-shift a CSV file', () => {
    const outputCsvFile = 'dates.actual.csv';
    const output = execSync(
      `${cmd} deidDateShift "${csvFile}" "${outputCsvFile}" ${dateShiftAmount} ${dateShiftAmount} ${dateFields}`
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
    const output = execSync(
      `${cmd} deidDateShift "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount}`
    );
    assert.match(output, /Error in deidentifyWithDateShift/);
  });
});
