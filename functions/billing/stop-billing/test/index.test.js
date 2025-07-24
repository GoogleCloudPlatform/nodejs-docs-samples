// Copyright 2025 Google LLC
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

const assert = require('assert');
const {CloudEvent} = require('cloudevents');
const {getFunction} = require('@google-cloud/functions-framework/testing');

require('../index');

const getDataWithinBudget = () => {
  return {
    budgetDisplayName: 'BUDGET_NAME',
    costAmount: 5.0,
    costIntervalStart: new Date().toISOString(),
    budgetAmount: 10.0,
    budgetAmountType: 'SPECIFIED_AMOUNT',
    currencyCode: 'USD',
  };
};

const getDataOverBudget = () => {
  return {
    budgetDisplayName: 'BUDGET_NAME',
    alertThresholdExceeded: 0.9,
    costAmount: 20.0,
    costIntervalStart: new Date().toISOString(),
    budgetAmount: 10.0,
    budgetAmountType: 'SPECIFIED_AMOUNT',
    currencyCode: 'USD',
  };
};

/**
 * Get a simulated CloudEvent for a Budget notification.
 * Find more examples here:
 * https://cloud.google.com/billing/docs/how-to/budgets-programmatic-notifications
 * @param {boolean} isOverBudget - Whether or not the budget has been exceeded.
 * @returns {CloudEvent} The simulated CloudEvent.
 */
const getCloudEventOverBudgetAlert = isOverBudget => {
  let budgetData;

  if (isOverBudget) {
    budgetData = getDataOverBudget();
  } else {
    budgetData = getDataWithinBudget();
  }

  const jsonString = JSON.stringify(budgetData);
  const messageBase64 = Buffer.from(jsonString).toString('base64');

  const encodedData = {
    message: {
      data: messageBase64,
    },
  };

  return new CloudEvent({
    specversion: '1.0',
    id: 'my-id',
    source: '//pubsub.googleapis.com/projects/PROJECT_NAME/topics/TOPIC_NAME',
    data: encodedData,
    type: 'google.cloud.pubsub.topic.v1.messagePublished',
    datacontenttype: 'application/json',
    time: new Date().toISOString(),
  });
};

describe('Billing Stop Function', () => {
  let consoleOutput = '';
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  beforeEach(async () => {
    consoleOutput = '';
    console.log = message => (consoleOutput += message + '\n');
    console.error = message => (consoleOutput += 'ERROR: ' + message + '\n');
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should receive a notification within budget', async () => {
    const StopBillingCloudEvent = getFunction('StopBillingCloudEvent');
    const isOverBudget = false;
    await StopBillingCloudEvent(getCloudEventOverBudgetAlert(isOverBudget));

    assert.ok(
      consoleOutput.includes(
        'No action required. Current cost is within budget.'
      )
    );
  });

  it('should receive a notification exceeding the budget and simulate stopping billing', async () => {
    const StopBillingCloudEvent = getFunction('StopBillingCloudEvent');
    const isOverBudget = true;
    await StopBillingCloudEvent(getCloudEventOverBudgetAlert(isOverBudget));

    assert.ok(consoleOutput.includes('Getting billing info'));
    assert.ok(consoleOutput.includes('Disabling billing for project'));
    assert.ok(consoleOutput.includes('Billing disabled. (Simulated)'));
  });
});
