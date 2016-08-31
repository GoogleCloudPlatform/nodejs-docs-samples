<img src="https://avatars2.githubusercontent.com/u/2810941?v=3&s=96" alt="Google Cloud Platform logo" title="Google Cloud Platform" align="right" height="96" width="96"/>

# Datastore Node.js Samples

[Cloud Datastore][datastore_docs] is a NoSQL document database built for
automatic scaling, high performance, and ease of application development.

[datastore_docs]: https://cloud.google.com/datastore/docs/

## Table of Contents

* [Setup](#setup)
* [Samples](#samples)
  * [Tasks](#tasks)
  * [Concepts](#concepts)
  * [Errors and Error Handling](#errors-and-error-handling)

## Setup

1. Read [Prerequisites][prereq] and [How to run a sample][run] first.
1. Install dependencies:

        npm install

[prereq]: ../README.md#prerequisities
[run]: ../README.md#how-to-run-a-sample

## Samples

### Tasks

View the [documentation][tasks_0_docs] or the [source code][tasks_0_code].

__Usage:__ `node tasks --help`

```
Usage:

  new <description> Adds a task with a description <description>
  done <task-id>    Marks a task as done
  list              Lists all tasks by creation time
  delete <task-id>  Deletes a task
```

[tasks_0_docs]: https://cloud.google.com/datastore/docs/datastore-api-tutorial
[tasks_0_code]: tasks.js

### Concepts

View the [documentation][concepts_1_docs] or the [source code][concepts_1_code].[concepts_1_docs]: https://cloud.google.com/datastore/docs/concepts/entities
[concepts_1_code]: concepts.js

### Errors and Error Handling

View the [documentation][error_2_docs] or the [source code][error_2_code].

__Usage:__ `node error`
[error_2_docs]: https://cloud.google.com/datastore/docs/concepts/errors
[error_2_code]: error.js
