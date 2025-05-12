# How to become a contributor and submit your own code

This repository contains samples that the documentation on [Google Cloud
Platform ][cloud] references. Samples for a client library should be added to
the client repository, not this repository. (For example, the `functions` folder
is reserved for samples used in
[cloud.google.com/functions](https://cloud.google.com/functions)). If you wrote
a great sample but it is not used in Google's official documentation, there are
better suited places to publish it such as a [community
tutorial](https://cloud.google.com/community/).

## Run the tests

### Run the tests locally for a single sample

1. Obtain authentication credentials. Depending on the sample, you need to
enable the appropriate APIs in the [Cloud
Console](https://console.cloud.google.com/apis/library).

        gcloud auth application-default login

1. Change directory to one of the sample folders, e.g. `run/helloworld`.

        cd run/helloworld

1. Install the dependencies.

        npm install

1. Run the tests.

        npm test

### Running the tests for a Pull Request

When a Pull Request is opened, reopened, or has new commits pushed the sample tests (unit, integration, end-to-end) will be run.

If the tests for a sample change do not run, they can be triggered by adding the `actions:force-run` label.

If tests need to be triggered multiple times, manually remove `actions:force-run` and then re-add this label.

The automatic clean-up of labels is currently disabled. Please remove the actions:force-run before merging the Pull Request.

## Adding new samples

All samples must have tests. We use `mocha` as testing framework. The
`package.json` file within your sample directory must contain a test script that
executes the `mocha` tests via `npm test`
([example](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/blob/main/batch/package.json#L13)).

### Third party libraries

Contributors are encouraged to use vanilla Node.js as much as pragmatically
possible to standardize writing, reviewing, and maintaining samples and their
tests, ideally reducing dependencies on third party libraries.

For tests, we recommend using the standard
library [assert](https://nodejs.org/docs/latest-v18.x/api/assert.html). The library provides a strict and a legacy mode; please use the
strict mode as shown below:

```js
const assert = require('node:assert/strict');
```

### CI testing

> **tl;dr**: Any check with `(dev)`, `(experimental)`, or `(legacy)` can be ignored and should **not block** your PR from merging.

This repository uses the 🍮 **Custard CI** from
[`GoogleCloudPlatform/cloud-samples-tools`](https://github.com/GoogleCloudPlatform/cloud-samples-tools)
to set up and run tests.

First, it checks which files changed in a PR to find which packages were affected.
In this repo, a _package_ is defined as a directory containing a `package.json` file.

If a global file (not belonging to a package) is changed, all packages are marked as affected.
Global files are can contain repo-level configurations that could affect other packages.
Typically, contributors should only modify files in a package.

Only affected packages are linted and tested.
For tests, we use a
[matrix strategy](https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow)
to generate isolated jobs for each affected test.

We're working to improve the testing infrastructure, while keeping tests stable.
This means you'll sometimes see some new experimental tests, you can generally ignore them.
Or two versions of one test running while we make sure the new version works well.

Here's a list of which tests are required and which ones you can ignore.
* `Custard CI / lint`: (**required**) runs only for affected packages
* `Custard CI / tests`: (**required**) this succeeds until all tests have finished
* `Custard CI / test (package)`: (**required**) runs only for affected packages
* `(dev) Custard CI / test (package)`: (_ignore_) this test has errors we're working on
* `(experimental) Custard CI / ...`: (_ignore_) this is a new unstable version
* `Custard CI / (legacy) ...`: (_ignore_) this is the old version running while we make sure the new one works

### TypeScript Support

This repository also supports TypeScript samples. We use the
[typeless-sample-bot](https://github.com/googleapis/google-cloud-node/tree/main/packages/typeless-sample-bot)
to convert TypeScript samples to pure JavaScript, which avoids having to
maintain both TypeScript and JavaScript variants.

If you choose to write a TypeScript based sample, please follow these
guidelines:

* **Style**:
  * See the [Google TypeScript
    Guide](https://google.github.io/styleguide/tsguide.html). In particular,
    note to use types wherever possible, except for [trivially inferred
    types](https://google.github.io/styleguide/tsguide.html#type-inference) that
    do not aid in readability.
* **TypeScript Configuration**:
  * Include a
    [tsconfig.json](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)
    in the root of your sample directory.
  * It is recommended to set
    [https://www.typescriptlang.org/tsconfig#noImplicitAny](noImplicitAny) to
    `false`, but it may be needed to set this to `true` if you haven't fully
    migrated the sample to TypeScript.
  * You can find a minimal example
    [here](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/scheduler/tsconfig.json).
  * Include an `excludes` entry with your test files to avoid building `*.js`
    versions (which is already in the example).
* **Testing**: Use a `.ts` test runner.
  * It should be executed by the `npm test` command `mocha --require
    ts-node/register test/*.ts` in `package.json`.
  * A `ts-node` dependency will need to be added to `devDependencies` in your
    package.json file.
  * To execute TypeScript samples from your test, use `node --loader ts-node/esm
    <sample.ts>`.
* **Imports**: Use an `import` statement at the beginning of the file to enable
  importing types.
  * Within each commented "region tag," import required libraries with
    `required` using the CommonJS
    [require](https://nodejs.org/api/modules.html#requireid) module loader.
    (Note that the `import` style cannot be used anywhere except the top of the
    file.)
  * Each of these region tag sections are directly embedded in the Cloud
    documentation, so including the imports at the top of each region tag
    section shows our users which libraries are needed. They should be imported
    using `require` even if you have already imported the module at the top of
    the file outside of the region tag.
  * Some dependencies do not include type definitions. You may see a warning in
    your IDE that no types can be found. There are often additional `@types`
    dependencies, e.g. `@types/mocha` that provide these. They can be included
    in the `devDependencies` section of the `package.json`. If you are using
    imports from Node itself, you may need to also include `@types/node`.
* **Other Recommendations**:
  * Linting: See the example
    [.eslintrc.yml](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/scheduler/.eslintrc.yml).
  * JavaScript: Do not modify any `.js` files. The
    [typeless-sample-bot](https://github.com/googleapis/google-cloud-node/tree/main/packages/typeless-sample-bot)
    will overwrite them as it converts from TypeScript into JavaScript. **Do
    not** check in any generated `.js` tests from running `npm build`.
  * `package.json`: See a full set of npm targets in the scheduler
    [package.json](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/scheduler/package.json).

You can look at the
[scheduler](https://github.com/GoogleCloudPlatform/nodejs-docs-samples/tree/main/scheduler)
sample directory for an example of a TypeScript sample and its matching test
runner.

### Style

The [Google Cloud Samples Style Guide][style-guide] is considered the primary
guidelines for all Google Cloud samples.

[style-guide]: https://googlecloudplatform.github.io/samples-style-guide/

Samples in this repository also follow the JavaScript coding standards. See
instructions below to run the linter to match our JavaScript coding standards:

1. Install dependencies at the root of the `nodejs-docs-samples` directory.

        npm install

1. Run the linter for all samples, including the ones you're adding.

        npm run lint

[cloud]: https://cloud.google.com/

## Failing CI

`Required` tests need to pass. Tests that are not required are expected to fail,
they are usually work in progress.
