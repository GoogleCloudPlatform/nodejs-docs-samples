const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();
const bucket = process.env.FIRESTORE_EXPORT_BUCKET;

exports.scheduledFirestoreExport = (event, context) => {
  const databaseName = client.databasePath(
    process.env.GCLOUD_PROJECT,
    '(default)'
  );

  return client
    .exportDocuments({
      name: databaseName,
      outputUriPrefix: bucket,
      // Leave collectionIds empty to export all collections
      // or define a list of collection IDs:
      // collectionIds: ['users', 'posts']
      collectionIds: [],
    })
    .then(responses => {
      const response = responses[0];
      console.log(`Operation Name: ${response['name']}`);
      return response;
    })
    .catch(err => {
      console.error(err);
    });
};
