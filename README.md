<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Platform Node.js Samples [![Slack][slack_badge]][slack_link]

Node.js samples for [Google Cloud Platform products][cloud].

See [cloud.google.com/nodejs][cloud_nodejs] to get up and running with Node.js
on Google Cloud Platform.

[slack_badge]: https://img.shields.io/badge/slack-nodejs%20on%20gcp-E01563.svg	
[slack_link]: https://gcp-slack.appspot.com/
[cloud]: https://cloud.google.com/
[cloud_nodejs]: https://cloud.google.com/nodejs/


## Setup

### Prerequisites

1. Install [Node.js version 8 or greater][node]
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

1. Change directory to one of the sample folders, e.g. `bigquery`:

        cd bigquery/

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

### Node.js Codelab

In the [Node.js Web App Google Cloud Platform][codelab_docs] codelab, you learn
how to integrate Google Cloud Platform services into a Node.js web application
to store data, upload images, and authenticate users.

View the [tutorial][codelab_docs] or the [source code][codelab_code].

[codelab_docs]: https://gcplab.me/codelabs/cloud-nodejs/index.html
[codelab_code]: https://github.com/googlecodelabs/cloud-nodejs

## Contributing

Contributions welcome! See the [Contributing Guide][contrib].

[contrib]: CONTRIBUTING.md
