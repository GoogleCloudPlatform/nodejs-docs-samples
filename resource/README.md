<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Resource Manager Node.js Samples

Google Cloud Platform provides container resources such as Organizations and
Projects, that allow you to group and hierarchically organize other Cloud
Platform resources. This hierarchical organization lets you easily manage common
aspects of your resources such as access control and configuration settings. The
[Google Cloud Resource Manager API][resource_docs] enables you to
programmatically manage these container resources.

[resource_docs]: https://cloud.google.com/resource-manager/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Projects](#projects)
* [Running the tests](#running-the-tests)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

    With `npm`:

        npm install

    With `yarn`:

        yarn install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Projects

View the [documentation][projects_docs] or the [source code][projects_code].

__Usage:__ `node projects --help`

```
Commands:
  list  List all current projects.

Options:
  --help  Show help                                                                                            [boolean]

Examples:
  node projects.js list  Lists all current projects.

For more information, see https://cloud.google.com/resource-manager/docs
```

[projects_docs]: https://cloud.google.com/resource-manager/docs/
[projects_code]: projects.js

## Running the tests

1.  Set the `GCLOUD_PROJECT` and `GOOGLE_APPLICATION_CREDENTIALS` environment
    variables.

1.  Run the tests:

    With `npm`:

        npm test

    With `yarn`:

        yarn test
