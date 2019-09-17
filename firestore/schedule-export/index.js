const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const databaseName = client.databasePath(process.env.GCLOUD_PROJECT, '(default)');

exports.scheduledFirestoreExport = (event, context) => {

// Replace BUCKET_NAME
const bucket = 'gs://<var>BUCKET_NAME</var>';
return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIDs empty to export all collections
    // or define a list of collection IDs:
    // collectionIds: ['users', 'posts']
    collectionIds: []
    })
  .then(responses => {
    const response = responses[0];
    console.log(`Operation Name: ${response['name']}`);
  })
  .catch(err => {
    console.error(err);
  });
};
