# Google App Engine Node.js Samples

These are samples for using Node.js on Google App Engine Managed VMs. These
samples are referenced from the [docs](https://cloud.google.com/appengine/docs).

See our other [Google Cloud Platform github repos](https://github.com/GoogleCloudPlatform)
for sample applications and scaffolding for other frameworks and use cases.

## Run Locally

Some samples have specific instructions. If there is a README in the sample
folder, please refer to it for any additional steps required to run the sample.

In general, the samples typically require:

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/), including the
[gcloud tool](https://cloud.google.com/sdk/gcloud/), and
[gcloud app component](https://cloud.google.com/sdk/gcloud-app).
1. Setup the gcloud tool. This provides authentication to Google Cloud APIs and
services.

        gcloud init

1. Clone this repo.

        git clone https://github.com/GoogleCloudPlatform/<REPO NAME>.git

1. Open a sample folder, install dependencies, and run the sample:

        cd <sample-folder>/
        npm install
        npm start

1. Visit the application at [http://localhost:8080](http://localhost:8080).

## Deploying

Some samples in this repositories may have special deployment instructions.
Refer to the README file in the sample folder.

1. Use the [Google Developers Console](https://console.developer.google.com) to
create a project/app id. (App id and project id are identical.)
1. Setup the gcloud tool, if you haven't already.

        gcloud init

1. Use gcloud to deploy your app.

        gcloud preview app deploy

1. Awesome! Your application is now live at `your-app-id.appspot.com`.
