# Node.js setup

The CI setup file is an _optional_ file to configure the testing infrastructure runtime environment on a per-package basis.
It _must_ be named `ci-setup.json` and be located in the same directory as the `package.json` file.

For example:

```sh
my-product/
└─ my-package/
   ├─ package.json   # package file
   └─ ci-setup.json  # setup file
```

## Default values

Here are the default values to be used if a `ci-setup.json` file is not present, or only some fields are defined.

```js
{
  "env": {},
  "secrets": {},
  "node-version": 20,
  "timeout-minutes": 10,
}
```

These are defined in the [`nodejs-prod.jsonc`](nodejs-prod.jsonc) config file.

### Environment variables

Environment variables are defined as a dictionary where the key is the environment variable name, and the value is the variable’s value.

For example:

```js
{
  "env": {
    "MY_VAR": "my-value",
    "MY_OTHER_VAR": "my-other-value"
  }
}
```

The test infrastructure then exports them as environment variables.

### Automatic environment variables

Additionally to the environment variables you define in the `ci-setup.json` file, the test infrastructure always exports the following environment variables:

- `PROJECT_ID`: The project used by the testing infrastructure.
- `RUN_ID`: A random unique identifier, different on every test run.

> **Note**: An environment variable explicitly defined under `env` with the same name as an automatic variable overrides the automatic variable.

### Environment variable interpolation

Environment variables support using variable interpolation in the format `$VAR` or `${VAR}`.
Secrets do not support this to avoid accidentally exposing secrets.

This can be useful for fully qualified resource names like `projects/$PROJECT_ID/resources/my-resource-id`, or to create unique resource names like `my-resource-$RUN_ID`.

## Unique resources

If a test creates and destroys their own resources, make sure the resource names are different for each run.
This can be done by appending a unique identifier to each resource ID. We can use the `$RUN_ID` environment variable.

For example:

```js
{
  "env": {
    "DATABASE": "projects/$PROJECT_ID/databases/my-db-$RUN_ID"
  }
}
```

For more information, see
[Concurrent runs](https://github.com/GoogleCloudPlatform/cloud-samples-tools/blob/main/docs/testing-guidelines.md#concurrent-runs)
in our testing guidelines.

### Secrets

Secrets can be defined as a dictionary where the key is the environment variable to which it’s exported to, and the value is the
[Secret Manager](https://cloud.google.com/security/products/secret-manager)
secret ID in the format `project-id/secret-id`.

For example:

```js
{
  "secrets": {
    "MY_SECRET": "$PROJECT_ID/my-secret-id",
    "MY_OTHER_SECRET": "$PROJECT_ID/my-other-secret-id"
  }
}
```

The test infrastructure then fetches the actual secret data and exports them as environment variables.

### Secrets vs environment variables

Most configuration should be directly set with environment variables.
This includes some things which might appear to be sensitive, but aren't.
Minimizing secrets helps reduce maintenance and troubleshooting efforts.

For example, when a secret gets exposed, we must go through all the secrets used on that repository, assess which ones are real secrets and rotate them, and provide a justificatin of secrets that weren't rotated because they're just configurations.
Keeping configurations as environment variables reduces the number of secrets needed to be assessed.

Examples of environment variables:

- Project IDs
- Cloud resource IDs (or ID templates for a set of tests)
- Service accounts emails (they look like email addresses, but aren't)
- Usernames and passwords for _private_ resources (meaning anyone without project permissions cannot access those resources, so they can’t even reach the login)

These items are also likely to appear in logs, and that is OK.

Some things really are secret and if exposed, would create opportunities for unauthorized access, fraud, etc.
The test infrastructure uses [Google Cloud Secret Manager](https://cloud.google.com/security/products/secret-manager) to store and retrieve secrets.

Examples of real secrets:

- API keys
- Auth tokens
- Identity tokens
- Service account credentials (the JSON content with the actual keys)
- Passwords or API keys to 3rd party services needed for testing
- Usernames and passwords for _public_ resources (accessible to anyone)

> **Important**: Test code and scripts should _**never log secret values**_.
> A test run printing a secret will stay in the commit history, even if another commit is made after.
> This requires rotating that secret.

> **Note**: These testing environment variables and secrets are completely separate from [GitHub Actions secrets](https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions) and variables.
> GitHub Actions secrets and variables are _not_ used by the testing infrastructure.

### Node version

You can opt in to use a different Node version if you need a specific version functionality.

For example:

```js
{
  "_justification": "My reason for using a specific Node version.",
  "node-version": 18,
}
```

We **strongly recommend** not overriding this unless it's a version-specific feature or test.

This _might_ raise flags during review.

If you have a valid reason to use a different Node version, please provide a justification as a `_comment`.

> **Note**: In the future, we might implement automatic checks to validate that tests are using the recommended default version.

### Test timeout

If your tests take longer than the default test timeout, you can opt in to override it.

For example:

```js
{
  "_justification": "My reason for this test to take longer to run.",
  "timeout-minutes": 30,
}
```

> **Note**: Overriding this **will** raise flags during review.

Tests should run fast, and the default timeout should be more than enough for most tests to run.
If your tests are taking longer, consider splitting them into subpackages.

For example:

```sh
my-product/
├─ snippets/
│  ├─ package.json
│  ├─ fast-samples.js
│  ├─ test/
│  │  └─ fast-samples.test.js
│  └─ slow-snippet/
│     ├─ package.json
│     ├─ slow-snippet.js
│     └─ test/
│        └─ slow-snippet.test.js
├─ new-feature/
│  ├─ package.json
│  ├─ new-feature.js
│  └─ test/
│     └─ new-feature.test.js
└─ e2e-sample/
   ├─ package.json
   ├─ slow-sample.js
   └─ test/
      └─ slow-sample.test.js
```

For more information, see
[Keep tests fast](https://github.com/GoogleCloudPlatform/cloud-samples-tools/blob/main/docs/testing-guidelines.md#keep-tests-fast)
in our testing guidelines.

If you have a valid reason to use a different timeout, please provide a justification as a `_comment`.

There is a hard limit of 120 minutes that cannot be overriden.

> **Note**: In the future, we might implement automatic checks to validate that tests run fast to safely reduce the default timeout.
