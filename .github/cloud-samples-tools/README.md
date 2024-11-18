# Cloud Samples tools

This is a collection of tools used for Cloud Samples maintenance and infrastructure.

This tool has one function:

- `affected` finds the affected packages given a list of diffs.

## Config files

For this tools, we refer to a **package** as an isolated directory, which contains a "package file".
For example, `package.json` in Node.js, `requirements.txt` in Python, `go.mod` in Go, or `pom.xml` in Java.

Each language has different configurations.
We define them in config files in the repository, this way the tooling keeps language agnostic and each repository can have different configurations.

The config file can be a `.json` file, or a `.jsonc` (JSON with comments) file.
For `.jsonc` files, it supports both `// single line comments` and `/* multi-line comments */`.

For example:

```jsonc
{
  // The package file where the tests should be run (required).
  "package-file": "package.json",

  // Match diffs only on .js and .ts files
  // Defaults to match all files.
  "match": ["*.js", "*.ts"],

  // Ignore diffs on the README, text files, and anything under node_modules/.
  // Defaults to not ignore anything.
  "ignore": ["README.md", "*.txt", "node_modules/"],

  // Skip these packages, these could be handled by a different config.
  // Defaults to not exclude anything.
  "exclude-packages": ["path/to/slow-to-test", "special-config-package"],
}
```

For more information, see [`pkg/utils/config.go`](pkg/utils/config.go).

## Building

To build the tools, we must change to the directory where the tools package is defined.
We can run it in a subshell using parentheses to keep our working directory from changing.

```sh
(cd .github/workflows/samples-tools && go build -o /tmp/tools ./cmd/*)
```

## Running the tools unit tests

To the tools tests, we must change to the directory where the tools package is defined.
We can run it in a subshell using parentheses to keep our working directory from changing.

```sh
(cd .github/workflows/samples-tools && go test ./...)
```

## Finding affected packages

> This must run at the repository root directory.

First, generate a file with all the diffs.
This file should be one file per line.

You can use `git diff` to test on files that have changed in your branch.
You can also create the file manually if you want to test something without commiting changes to your branch.

```sh
git --no-pager diff --name-only HEAD origin/main | tee /tmp/diffs.txt
```

Now we can check which packages have been affected.
We pass the config file and the diffs file as positional arguments.

```sh
/tmp/tools affected .github/config/nodejs.jsonc /tmp/diffs.txt
```
