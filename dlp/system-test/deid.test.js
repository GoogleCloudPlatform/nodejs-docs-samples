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
const proxyquire = require('proxyquire');
const sinon = require('sinon');
const {MOCK_DATA} = require('./mockdata');

const execSync = cmd => cp.execSync(cmd, {encoding: 'utf-8'});

const harmfulString = 'My SSN is 372819127';
const harmlessString = 'My favorite color is blue';
const surrogateType = 'SSN_TOKEN';
const csvFile = 'resources/dates.csv';
const tempOutputFile = path.join(__dirname, 'temp.result.csv');
const dateShiftAmount = 30;
const dateFields = 'birth_date,register_date';
const keyName = 'KEY_NAME';
const wrappedKey = 'WRAPPED_KEY';
const unwrappedKey = 'YWJjZGVmZ2hpamtsbW5vcA==';

const client = new DLP.DlpServiceClient();
describe('deid', () => {
  let projectId;

  before(async () => {
    projectId = await client.getProjectId();
  });

  afterEach(async () => {
    sinon.restore();
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

  // dlp_deidentify_simple_word_list
  it('should deidentify using the word list provided', () => {
    const textToInspect =
      'Patient was seen in RM-YELLOW then transferred to rm green.';
    const wordsStr = 'RM-GREEN,RM-YELLOW,RM-ORANGE';
    const customInfoTypeName = 'CUSTOM_ROOM_ID';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithSimpleWordList.js ${projectId} "${textToInspect}" "${wordsStr}" "${customInfoTypeName}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'Patient was seen in [CUSTOM_ROOM_ID] then transferred to [CUSTOM_ROOM_ID].'
    );
  });

  it('should handle deidentification errors', () => {
    const textToInspect =
      'Patient was seen in RM-YELLOW then transferred to rm green.';
    const wordsStr = 'RM-GREEN,RM-YELLOW,RM-ORANGE';
    const customInfoTypeName = 'CUSTOM_ROOM_ID';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithSimpleWordList.js 'BAD_PROJECT_ID' "${textToInspect}" "${wordsStr}" "${customInfoTypeName}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_exception_list
  it('should exclude the words during inspection', () => {
    const textToInspect =
      'jack@example.org accessed customer record of user5@example.com';
    const words = 'jack@example.org,jill@example.org';
    const infoTypes = 'EMAIL_ADDRESS';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithExceptionList.js ${projectId} "${textToInspect}" "${words}" "${infoTypes}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'jack@example.org accessed customer record of [EMAIL_ADDRESS]'
    );
  });

  it('should handle deidentification errors', () => {
    const textToInspect =
      'jack@example.org accessed customer record of user5@example.com';
    const words = 'jack@example.org,jill@example.org';
    const infoTypes = 'EMAIL_ADDRESS';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithExceptionList.js 'BAD_PROJECT_ID' "${textToInspect}" "${words}" "${infoTypes}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_redact
  it('should redact the matched input values', () => {
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    let output;
    try {
      output = execSync(
        `node deIdentifyWithRedaction.js ${projectId} "${string}" EMAIL_ADDRESS`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(
      output,
      'My name is Alicia Abernathy, and my email address is .'
    );
  });

  it('should handle deidentification errors', () => {
    let output;
    const string =
      'My name is Alicia Abernathy, and my email address is aabernathy@example.com.';
    try {
      output = execSync(
        `node deIdentifyWithRedaction.js ${projectId} "${string}" BAD_TYPE`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_infotypes
  it('should replace the matched input in table', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableInfoTypes.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.notMatch(output, /Charles Dickens/);
    assert.notMatch(output, /Jane Austen/);
    assert.notMatch(output, /Mark Twain/);
    assert.match(output, /PERSON_NAME/);
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deIdentifyTableInfoTypes.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_condition_masking
  it('should replace the matched input in table', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableConditionMasking.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /"stringValue":"\*\*"/);
    assert.match(output, /"integerValue":"21"/);
    assert.match(output, /"integerValue":"75"/);
    assert.notMatch(output, /"integerValue":"95"/);
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableConditionMasking.js BAD_PROJECT_ID'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_condition_infotypes
  it('should redact PERSON_NAME findings when conditions are met', () => {
    let output;
    try {
      output = execSync(
        `node deIdentifyTableConditionInfoTypes.js ${projectId}`
      );
    } catch (err) {
      output = err.message;
    }
    assert.notInclude(output, 'Charles Dickens');
    assert.include(output, 'Jane Austen');
    assert.include(output, 'Mark Twain');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync(
        'node deIdentifyTableConditionInfoTypes.js BAD_PROJECT_ID'
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_row_suppress
  it('should suppress a row if conditions are met', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableRowSuppress.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.notInclude(output, 'Charles Dickens');
    assert.include(output, 'Jane Austen');
    assert.include(output, 'Mark Twain');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deIdentifyTableRowSuppress.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_bucketing
  it('should transform column HAPPINESS SCORE using table bucketing configs', () => {
    let output;
    try {
      output = execSync(`node deIdentifyTableBucketing.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.include(output, '90:100');
    assert.include(output, '20:30');
    assert.include(output, '70:80');
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deIdentifyTableBucketing.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_time_extract
  it('should replace sensitive data in a string using time extraction', () => {
    let output;
    try {
      output = execSync(`node deidentifyWithTimeExtraction.js ${projectId}`);
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /"stringValue":"1970"/);
    assert.match(output, /"stringValue":"1996"/);
    assert.match(output, /"stringValue":"1988"/);
    assert.match(output, /"stringValue":"2001"/);
  });

  it('should handle deidentification errors', () => {
    let output;
    try {
      output = execSync('node deidentifyWithTimeExtraction.js BAD_PROJECT_ID');
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_deidentify_table_fpe
  it('should de-identify table using Format Preserving Encryption (FPE)', async () => {
    const CONSTANT_DATA = MOCK_DATA.DEIDENTIFY_TABLE_WITH_FPE(
      projectId,
      'NUMERIC',
      keyName,
      wrappedKey
    );

    const mockDeidentifyContent = sinon
      .stub()
      .resolves(CONSTANT_DATA.RESPONSE_DEIDENTIFY_CONTENT);

    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'deidentifyContent',
      mockDeidentifyContent
    );
    sinon.replace(console, 'log', () => sinon.stub());

    const deIdentifyTableWithFpe = proxyquire('../deIdentifyTableWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    await deIdentifyTableWithFpe(projectId, 'NUMERIC', keyName, wrappedKey);

    sinon.assert.calledOnceWithExactly(
      mockDeidentifyContent,
      CONSTANT_DATA.REQUEST_DEIDENTIFY_CONTENT
    );
  });

  it('should handle de-identification errors', async () => {
    const mockDeidentifyContent = sinon.stub().rejects(new Error('Failed'));
    sinon.replace(
      DLP.DlpServiceClient.prototype,
      'deidentifyContent',
      mockDeidentifyContent
    );
    sinon.replace(console, 'log', () => sinon.stub());

    const deIdentifyTableWithFpe = proxyquire('../deIdentifyTableWithFpe', {
      '@google-cloud/dlp': {DLP: DLP},
    });

    try {
      await deIdentifyTableWithFpe(projectId, 'NUMERIC', keyName, wrappedKey);
    } catch (error) {
      assert.equal(error.message, 'Failed');
    }
  });

  // dlp_deidentify_free_text_with_fpe_using_surrogate
  it('should de-identify table using Format Preserving Encryption (FPE) with surrogate', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithFpeSurrogate.js ${projectId} "My phone number is 4359916732" ALPHA_NUMERIC PHONE_NUMBER PHONE_TOKEN "${unwrappedKey}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /PHONE_TOKEN\(10\):Vz6T6ff4J7/);
  });

  it('should handle de-identification errors', () => {
    let output;
    try {
      output = execSync(
        `node deidentifyWithFpeSurrogate.js ${projectId} "My phone numer is 4359916732" ALPHA_NUMERIC BAD_TYPE PHONE_TOKEN "${unwrappedKey}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });

  // dlp_reidentify_free_text_with_fpe_using_surrogate
  it('should re-identify table using Format Preserving Encryption (FPE) with surrogate', () => {
    let output;
    try {
      output = execSync(
        `node reidentifyWithFpeSurrogate.js ${projectId} "My phone number is PHONE_TOKEN(10):Vz6T6ff4J7" ALPHA_NUMERIC PHONE_TOKEN "${unwrappedKey}"`
      );
    } catch (err) {
      output = err.message;
    }
    assert.match(output, /My phone number is 4359916732/);
  });

  it('should handle re-identification errors', () => {
    let output;
    try {
      output = execSync(
        `node reidentifyWithFpeSurrogate.js ${projectId} "My phone number is PHONE_TOKEN(10):Vz6T6ff4J7" ALPHA_NUMERIC PHONE_TOKEN INVALID_KEY`
      );
    } catch (err) {
      output = err.message;
    }
    assert.include(output, 'INVALID_ARGUMENT');
  });
});
