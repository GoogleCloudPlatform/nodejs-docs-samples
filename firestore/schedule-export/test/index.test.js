const assert = require('assert');
const cloudFunction = require('../');

/*
 * Integration test depends on env vars
 * FIRESTORE_EXPORT_BUCKET and GCLOUD_PROJECT
 * Assumes GAE service account has correct IAM permissions:
 * https://cloud.google.com/firestore/docs/solutions/schedule-export#configure_access_permissions
 */

describe('firestore/schedule-export', () => {
  it('initiates an export', () => {
    cloudFunction.scheduledFirestoreExport().then(response => {
      assert(response['name'].includes('Operation Name:'));
    });
  });
});
