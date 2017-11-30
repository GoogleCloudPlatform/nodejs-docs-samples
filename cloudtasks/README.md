<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Google Cloud Tasks API Node.js Samples

The [Cloud Tasks API](https://cloud.google.com/cloud-tasks/docs) enables
developers to manage the execution of large numbers of distributed requests.

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Tasks](#tasks)
* [Running the tests](#running-the-tests)

## Setup

1.  Read [Prerequisites][prereq] and [How to run a sample][run] first.
1.  Install dependencies:

    With **npm**:

        npm install

    With **yarn**:

        yarn install

[prereq]: ../README.md#prerequisites
[run]: ../README.md#how-to-run-a-sample

## Samples

### Tasks

View the [documentation][tasks_0_docs] or the [source code][tasks_0_code].

__Usage:__ `node tasks.js --help`

```
tasks.js <command>

Commands:
  tasks.js create <project> <location> <queue>  Create a task.
  tasks.js pull <project> <location> <queue>    Pull a task.
  tasks.js acknowledge <task>                   Acknowledge a task.

Options:
  --version  Show version number                                                                               [boolean]
  --help     Show help                                                                                         [boolean]

Examples:
  node tasks.js create my-project-id us-central1 my-queue
  node tasks.js pull my-project-id us-central1 my-queue
  node tasks.js acknowledge
  '{"name":"projects/my-project-id/locations/us-central1/queues/my-queue/tasks/1234","scheduleTime":"2017-11-01T22:27:
  53.628279Z"}'

For more information, see https://cloud.google.com/cloud-tasks/docs
```

[tasks_0_docs]: https://cloud.google.com/cloud-tasks/docs
[tasks_0_code]: tasks.js

## Running the tests

1.  Set the **GCLOUD_PROJECT** and **GOOGLE_APPLICATION_CREDENTIALS** environment variables.

1.  Run the tests:

    With **npm**:

        npm test

    With **yarn**:

        yarn test
