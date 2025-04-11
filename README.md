<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Platform Node.js Samples

Node.js samples for [Google Cloud Platform products][cloud].

See [cloud.google.com/nodejs][cloud_nodejs] to get up and running with Node.js
on Google Cloud Platform.

To browse documentation pages that use the samples found in this repository,
visit the [Google Cloud Samples][cloud_samples] page.

[cloud]: https://cloud.google.com/
[cloud_nodejs]: https://cloud.google.com/nodejs/
[cloud_samples]: https://cloud.google.com/docs/samples?language=nodejs%2Ctypescript

## Setup

1. Install [Node.js version 18 or greater][node]
1. Install the [Google Cloud CLI (gcloud)][gcloud]
1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

1. Obtain authentication credentials.

    Create local credentials by running the following command and following the
    oauth2 flow (read more about the command [here][auth_command]):

        gcloud auth application-default login

    Read more about [Google Cloud Platform Authentication][gcp_auth].

[node]: https://nodejs.org/
[gcloud]: https://cloud.google.com/sdk/docs/install
[auth_command]: https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login
[gcp_auth]: https://cloud.google.com/docs/authentication#projects_and_resources

## How to run a sample

1. Change directory to one of the sample folders, e.g. `run/helloworld`:

        cd run/helloworld

1. Install the sample's dependencies (see the sample's README for details):

        npm install

      * For samples with an available TypeScript variant, compile the 
      TypeScript code:
   
                npm run build

1. Run the sample:

        npm start [args]...

## Other sample applications

### Bookshelf tutorial app

The [Bookshelf app][bookshelf_docs] is a sample web app written in Node.js that
shows you how to use a variety of Google Cloud Platform features.

View the [tutorial][bookshelf_docs] or the [source code][bookshelf_code].

[bookshelf_docs]: https://cloud.google.com/nodejs/getting-started/tutorial-app
[bookshelf_code]: https://github.com/GoogleCloudPlatform/nodejs-getting-started

## Contributing

Contributions welcome! See the [Contributing Guide][contrib].

[contrib]: CONTRIBUTING.md
