/**
 * @fileoverview Sample code that grabs default credentials from the
 * environment, then uses it to make an api call.
 */
'use strict';

var google = require('googleapis');

/**
 * Callback for remote requests.
 *
 * @callback requestCallback
 * @param {Object} error - if there's an error with the request, this is pass
 * through to the callback.
 * @param {Object} response - the response for the request.
 */

/**
 * Fetches a list of the buckets under the given project id.
 *
 * @param {String} projectId - the project id that owns the buckets.
 * @param {requestCallback} callback - a function to be called when the server
 *     responds with the list of buckets.
 */
// [START list_buckets]
function listBuckets(projectId, callback) {
  google.auth.getApplicationDefault(function(error, authClient) {
    if (error) {
      return callback(error);
    }

    // Depending on the environment that provides the default credentials
    // (eg Compute Engine, App Engine), the credentials may require us to
    // specify the scopes we need explicitly.
    // Check for this case, and inject the Cloud Storage scope if required.
    if (authClient.createScopedRequired &&
        authClient.createScopedRequired()) {
      authClient = authClient.createScoped(
          ['https://www.googleapis.com/auth/devstorage.read_write']);
    }

    // Create the service object.
    var storage = google.storage('v1');
    // Make the api call to list the buckets.
    storage.buckets.list({
      auth: authClient,
      project: projectId
    }, callback);
  });
}
// [END list_buckets]

module.exports = {
  listBuckets: listBuckets
};
