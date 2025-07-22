const assert = require('assert');
const { CloudEvent } = require('cloudevents');
const { getFunction } = require('@google-cloud/functions-framework/testing');

require('../stop_billing');

const getCloudEventBudgetAlert = () => {
  const budgetData = {
    "budgetDisplayName": "BUDGET_NAME",
    "alertThresholdExceeded": 1.0,
    "costAmount": 2.0,
    "costIntervalStart": "2025-05-01T07:00:00Z",
    "budgetAmount": 0.01,
    "budgetAmountType": "SPECIFIED_AMOUNT",
    "currencyCode": "USD"
  };

  const jsonString = JSON.stringify(budgetData);
  const messageBase64 = Buffer.from(jsonString).toString('base64');

  const encodedData = {
    "message": {
      "data": messageBase64
    }
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
    console.log = (message) => consoleOutput += message + '\n';
    console.error = (message) => consoleOutput += "ERROR: " + message + '\n';
  });

  afterEach(() => {
    console.log = originalConsoleLog;
    console.error = originalConsoleError;
  });

  it('should receive a budget alert and simulate stopping billing', async () => {
    const StopBillingCloudEvent = getFunction("StopBillingCloudEvent");
    StopBillingCloudEvent(getCloudEventBudgetAlert());

    assert.ok(consoleOutput.includes('Getting billing info'));
    assert.ok(consoleOutput.includes('Disabling billing for project'));
    assert.ok(consoleOutput.includes('Billing disabled. (Simulated)'));
  });
});