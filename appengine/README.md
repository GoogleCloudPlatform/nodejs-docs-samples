# Google App Engine Node.js Samples

These are samples for using [Node.js][nodejs] on
[Google App Engine][appengine]. Many of these samples
are referenced from the documentation on [cloud.google.com][appengine].

There are also samples [submitted by the community][community_samples].

See our other [Google Cloud Platform GitHub repositories](/GoogleCloudPlatform)
for sample applications and scaffolding for other frameworks and use cases.

* [Run Locally](#run-locally)
* [Deploying](#deploying)
* [Official samples](#official-samples)
* [Community samples](#community-samples)

## Run Locally

Some samples have specific instructions. If there is a `README.md` file in the
sample folder, please refer to it for any additional steps required to run the
sample.

The App Engine Node.js samples typically that you do the following:

1.  [Setup your environment for Node.js developement][nodejs_dev].
1.  [Install the Google Cloud SDK][sdk].
1.  Acquire local credentials for authenticating with Google Cloud Platform APIs:

        gcloud auth application-default login

1.  Clone this repo:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

1.  Choose a sample:

        cd appengine/sample-folder/

1.  Install depedencies:

        npm install

1.  Run the sample with `npm` (See the sample's `README.md` file for
    any additional setup):

        npm start


1.  Visit the application at [http://localhost:8080][].

## Deploying

Some samples may have special deployment instructions.
Refer to the `README.md` file in the sample folder.

Many samples in this folder can be deployed to both App Engine Node.js standard
environment and flexible environment. Those samples come with two different
App Engine configuration files: `app.flexible.yaml` for flexible environment,
and `app.standard.yaml` for standard environment.

Samples with one single configuration file, `app.yaml`, can only be deployed
to one of the two environments. See the `README.md` files for these samples
for more information.

Generally speaking, to deploy a sample application:

1.  Use the [Google Cloud Console][console] to create a Google Cloud Platform
    project.
1.  [Enable billing][billing] for your project.

1.  Use the Cloud SDK to deploy your app.

    For samples with two configuration files (`app.flexible.yaml` and
    `app.standard.yaml`), if you plan to use App Engine Node.js Standard
    Environment, run

        gcloud app deploy app.standard.yaml

    To deploy to App Engine Node.js Flexible Environment, run

        gcloud app deploy app.flexible.yaml

    For samples with one configuration file (`app.yaml`), run

        gcloud app deploy

    to deploy the app to its compatible environment.

1.  View your deployed application at `https://YOUR_PROJECT_ID.appspot.com`.

## Official samples

View the [Official App Engine Node.js samples][official_samples].

## Community samples

View the [Community-contributed App Engine Node.js samples][community_samples].

[nodejs]: https://nodejs.org/
[appengine]: https://cloud.google.com/appengine/
[nodejs_dev]: https://cloud.google.com/community/tutorials/how-to-prepare-a-nodejs-dev-environment
[sdk]: https://cloud.google.com/sdk/
[console]: https://console.cloud.google.com
[billing]: https://support.google.com/cloud/answer/6293499#enable-billing
[official_samples]: https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/master/appengine
[community_samples]: https://cloud.google.com/community/tutorials/?q=%22Node.js%22
