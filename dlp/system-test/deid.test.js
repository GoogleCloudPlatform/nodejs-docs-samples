/**
 * Copyright 2018, Google, Inc.
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

const path = require('path');
const {assert} = require('chai');
const fs = require('fs');
const cp = require('child_process');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const cmd = 'node deid.js';
const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';
const surrogateType = 'SSN_TOKEN';
let labeledFPEString;
const wrappedKey = process.env.DLP_DEID_WRAPPED_KEY;
const keyName = process.env.DLP_DEID_KEY_NAME;
const csvFile = 'resources/dates.csv';
const tempOutputFile = path.join(__dirname, 'temp.result.csv');
const csvContextField = 'name';
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
  it('should FPE encrypt sensitive data in a string', () => {
    const output = execSync(
      `${cmd} deidFpe "${harmfulString}" ${wrappedKey} ${keyName} -a NUMERIC`
    );
    assert.match(output, /My SSN is \d{9}/);
    assert.notInclude(output, harmfulString);
  });

  it('should use surrogate info types in FPE encryption', () => {
    const output = execSync(
      `${cmd} deidFpe "${harmfulString}" ${wrappedKey} ${keyName} -a NUMERIC -s ${surrogateType}`
    );
    assert.match(output, /My SSN is SSN_TOKEN\(9\):\d{9}/);
    labeledFPEString = output;
  });

  it('should ignore insensitive data when FPE encrypting a string', () => {
    const output = execSync(
      `${cmd} deidFpe "${harmlessString}" ${wrappedKey} ${keyName}`
    );
    assert.include(output, harmlessString);
  });

  it('should handle FPE encryption errors', () => {
    const output = execSync(
      `${cmd} deidFpe "${harmfulString}" ${wrappedKey} BAD_KEY_NAME`
    );
    assert.match(output, /Error in deidentifyWithFpe/);
  });

  // reidentify_fpe
  it('should FPE decrypt surrogate-typed sensitive data in a string', () => {
    assert.ok(labeledFPEString, 'Verify that FPE encryption succeeded.');
    const output = execSync(
      `${cmd} reidFpe "${labeledFPEString}" ${surrogateType} ${wrappedKey} ${keyName} -a NUMERIC`
    );
    assert.include(output, harmfulString);
  });

  it('should handle FPE decryption errors', () => {
    const output = execSync(
      `${cmd} reidFpe "${harmfulString}" ${surrogateType} ${wrappedKey} BAD_KEY_NAME -a NUMERIC`
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

  it('should date-shift a CSV file using a context field', () => {
    const outputCsvFile = 'dates-context.actual.csv';
    const expectedCsvFile =
      'system-test/resources/date-shift-context.expected.csv';
    const output = execSync(
      `${cmd} deidDateShift "${csvFile}" "${outputCsvFile}" ${dateShiftAmount} ${dateShiftAmount} ${dateFields} -f ${csvContextField} -n ${keyName} -w ${wrappedKey}`
    );
    assert.include(
      output,
      `Successfully saved date-shift output to ${outputCsvFile}`
    );
    assert.include(
      fs.readFileSync(outputCsvFile).toString(),
      fs.readFileSync(expectedCsvFile).toString()
    );
  });

  it('should require all-or-none of {contextField, wrappedKey, keyName}', () => {
    const output = execSync(
      `${cmd} deidDateShift "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount} ${dateFields} -f ${csvContextField} -n ${keyName}`
    );
    assert.match(output, /You must set either ALL or NONE of/);
  });

  it('should handle date-shift errors', () => {
    const output = execSync(
      `${cmd} deidDateShift "${csvFile}" "${tempOutputFile}" ${dateShiftAmount} ${dateShiftAmount}`
    );
    assert.match(output, /Error in deidentifyWithDateShift/);
  });
});
