<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Platform Node.js Samples [![Slack][slack_badge]][slack_link]

Node.js samples for [Google Cloud Platform products][cloud].

See [cloud.google.com/nodejs][cloud_nodejs] to get up and running with Node.js
on Google Cloud Platform.

[slack_badge]: https://img.shields.io/badge/slack-Google%20Cloud%20Platform-E01563.svg
[slack_link]: https://googlecloud-community.slack.com/
[cloud]: https://cloud.google.com/
[cloud_nodejs]: https://cloud.google.com/nodejs/

## Google Cloud Samples

To browse ready to use code samples check [Google Cloud Samples](https://cloud.google.com/docs/samples?l=nodejs).

## Setup

### Prerequisites

1. Install [Node.js version 10 or greater][node]
1. Clone this repository:

        git clone https://github.com/GoogleCloudPlatform/nodejs-docs-samples.git

1. Obtain authentication credentials.

    Create local credentials by running the following command and following the
    oauth2 flow (read more about the command [here][auth_command]):

        gcloud auth application-default login

    Read more about [Google Cloud Platform Authentication][gcp_auth].


[node]: https://nodejs.org/
[auth_command]: https://cloud.google.com/sdk/gcloud/reference/beta/auth/application-default/login
[gcp_auth]: https://cloud.google.com/docs/authentication#projects_and_resources

### How to run a sample

1. Change directory to one of the sample folders, e.g. `datastore`:

        cd datastore/

1. Install the sample's dependencies (see the sample's README for details):

        npm install

1. Run the sample:

        node sample_file.js [args]...

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
