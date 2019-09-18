const assert = require('assert');
const cloudFunction = require('../');

describe('firestore/schedule-export', () => {
  it('initiates an export', () => {
    cloudFunction.scheduledFirestoreExport().then(response => {
      assert(response['name'].includes('Operation Name:'));
    });
  });
});
