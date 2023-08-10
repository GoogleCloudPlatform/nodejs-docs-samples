<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Platform Node.js Samples [![Slack][slack_badge]][slack_link]

Node.js samples for [Google Cloud Platform products][cloud].

See [cloud.google.com/nodejs][cloud_nodejs] to get up and running with Node.js
on Google Cloud Platform.

To browse documentation pages that use the samples found in this repository,
visit the [Google Cloud Samples][cloud_samples] page.

## Setup

1. Install [Node.js version 10 or greater][node]
1. Install the [Google Cloud CLI (gcloud)][gcloud]
1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

1. Obtain authentication credentials.

    Create local credentials by running the following command and following the
    oauth2 flow (read more about the command [here][auth_command]):

        gcloud auth application-default login

    Read more about [Google Cloud Platform Authentication][gcp_auth].


## How to run a sample

1. Change directory to one of the sample folders, e.g. `datastore`:

        cd datastore/

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

## Contributing

Contributions welcome! See the [Contributing Guide][contrib].

[slack_badge]: https://img.shields.io/badge/slack-Google%20Cloud%20Platform-E01563.svg
[slack_link]: https://googlecloud-community.slack.com/
[cloud]: https://cloud.google.com/
[cloud_nodejs]: https://cloud.google.com/nodejs/
[node]: https://nodejs.org/
[auth_command]: https://cloud.google.com/sdk/gcloud/reference/auth/application-default/login
[gcp_auth]: https://cloud.google.com/docs/authentication#projects_and_resources
[gcloud]: https://cloud.google.com/sdk/docs/install
[cloud_samples]: https://cloud.google.com/docs/samples?l=python&language=nodejs%2Ctypescript
[bookshelf_docs]: https://cloud.google.com/nodejs/getting-started/tutorial-app
[bookshelf_code]: https://github.com/GoogleCloudPlatform/nodejs-getting-started
[contrib]: CONTRIBUTING.md