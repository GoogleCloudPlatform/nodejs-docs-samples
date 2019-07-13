# Setting up a Token Service for mobile applications

This sample will show you how to connect your mobile app to Google Cloud Platform. To do this, you will be implementing something called a token service. The token service provides your application with short-lived OAuth2.0 tokens, which can be used to communicate with GCP’s APIs. The reason you need an OAuth2.0 token is that a GCP API requires the caller to be authenticated and authorized to access an API. 

To do this, you will set up the token service which will be implemented on Cloud Functions for Firebase. The token service handles requests from the client app and retrieves from cloud firestore database or creates the OAuth2.0 token credentials via the Cloud IAM API. These tokens are then stored in a Cloud Firestore database so that they can be used for future requests from a client, until they expire. To ensure clients don’t receive an expired token, the service validates that credentials haven't expired before triggering a push notification from Firebase Cloud Messaging back to the calling client.

View the [source code][9]


## Prerequisites

Before using the sample app, make sure that you have the following
prerequisites:

* [Node.js 8][7]
* [Firebase Command Line Interface (CLI) Tool][6]
* Create a project (or use an existing one) in the [Google Cloud Console][8]

## Configuring the sample

To configure the sample you must declare the required environment variables, and install the [Cloud Functions Node.js emulator][2].

The sample requires the following environment variables:

* `GOOGLE_CLOUD_PROJECT`: The project id of your GCP project.
* `GOOGLE_APPLICATION_CREDENTIALS`: The path to your API key file.

Use the following commands to declare the required environment variables:

```
export GCF_REGION=us-central1
export GOOGLE_CLOUD_PROJECT=[your-GCP-project-id]
export BASE_URL=http://localhost:8010/$GOOGLE_CLOUD_PROJECT/$GCF_REGION
export GOOGLE_APPLICATION_CREDENTIALS=[path-to-your-API-key-file]
```

Run the following commands to install and start the Cloud Functions emulator:

```
npm install -g @google-cloud/functions-emulator
functions-emulator start
```

Run the following command to set the gcloud projectID and sign in to firebase  :

```
functions config set projectId $GOOGLE_CLOUD_PROJECT
firebase login
```
Run the following command which prompts you to choose from one of your existing projects:

```
firebase use --add
```
## Deploy and Test

1. Clone this repository:

  `git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git`
  ` nodejs-docs-samples/functions/tokenService`
  
2. Deploy the "getOAuthToken" function with an HTTP trigger:

  `functions deploy getOAuthToken --trigger--http`

3. To run the tests, use the following commands from the

  `functions/tokenservice` folder:

```
npm install && npm test
```

## How to call exported API from client 
 
### Available Samples

### iOS 
 
 AuthLibrary [FCMTokenProvider.swift][1] has implemented how to call getOAuthToken API 
 
  `google-auth-library-swift/Sources/OAuth2/FirebaseFunctionTokenProvider/`
 
 Please refer [ios-docs-samples][3]`https://github.com/GoogleCloudPlatform/ios-docs-samples.git` 

 
 ### Android
 
 Please refer [android-docs-samples][4]
 
 
  
[0]: https://cloud.google.com
[1]: https://github.com/googleapis/google-auth-library-swift
[2]: https://cloud.google.com/functions/docs/emulator
[3]: https://github.com/GoogleCloudPlatform/ios-docs-samples.git
[4]: https://github.com/GoogleCloudPlatform/android-docs-samples
[5]: https://nodejs.org/en/
[6]: https://firebase.google.com/docs/cli
[8]: https://console.cloud.google.com
[9]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/master/functions/dialogflow/functions/index.js

