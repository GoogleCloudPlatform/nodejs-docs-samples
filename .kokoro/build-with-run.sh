#!/bin/bash

# Copyright 2019 Google LLC.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -eo pipefail

_run_error_log() {
  echo "error: line $(caller)"
}

trap '_run_error_log' ERR

# Unsetting to use latest python 3 than python 2
unset CLOUDSDK_PYTHON

# Activate mocha config
export MOCHA_REPORTER_OUTPUT=${PROJECT}_sponge_log.xml
export MOCHA_REPORTER=xunit
pushd github/nodejs-docs-samples
mv .kokoro/.mocharc.js .
popd

export GOOGLE_CLOUD_PROJECT=nodejs-docs-samples-tests
pushd github/nodejs-docs-samples/${PROJECT}

# Verify changes are worth testing.
# Identify changes excluding files that have no bearing on sample functionality.
ignore_pattern='\.md$|^\.github|\.gitignore|^LICENSE|^CODEOWNERS|^\.eslint|\.prettier|^linkinator|^renovate'
SIGNIFICANT_CHANGES="$(git --no-pager diff --name-only main..HEAD | grep -Ev ${ignore_pattern} || true)"

# If this is a PR with only insignificant changes, don't run any tests.
if [[ -n ${KOKORO_GITHUB_PULL_REQUEST_NUMBER:-} ]] && [[ -z "$SIGNIFICANT_CHANGES" ]]; then
  echo "No significant changes. Skipping ${PROJECT} tests."
  exit 0
fi

# CHANGED_DIRS is the list of directories that changed.
# CHANGED_DIRS will be empty when run on main.
CHANGED_DIRS=$(echo "$SIGNIFICANT_CHANGES" | tr ' ' '\n' | xargs dirname 2>/dev/null || true)

# Default to not running the test.
match=0

# If CHANGED_DIRS is empty, default to running the tests.
# This ensures nightly tests will run.
if [[ "$CHANGED_DIRS" == "" ]]; then
  echo "Running the test: Run all tests on the main branch."
  match=1
fi

# PROJECT is set by Kokoro to the path of the Cloud Run sample under test.
# If any of our changed directories starts with that path, run the tests.
# Otherwise, skip running the tests.
# The asterisk in "$PROJECT"* is what causes the tests to run if any
# sub-directory carries a change.
for c in ${CHANGED_DIRS}; do
  if [[ "$c" == "$PROJECT"* ]]; then
    echo "Running the test: Changes found inside '{$PROJECT}'"
    match=1
  fi
done

# If Cloud Run related Kokoro config is changed, run the tests.
# This matches on all Cloud Run tests if any config is modified.
for k in '.kokoro/build-with-run.sh' '.kokoro/common.cfg' '.kokoro/.mocharc.js' '.kokoro/run'; do
  for s in ${SIGNIFICANT_CHANGES}; do
    if [[ "$s" == "$k"* ]]; then
      echo "Running the test: Changes to Cloud Run .kokoro configuration detected"
      match=1
    fi
  done
done

if [[ $match == 0 ]]; then
  echo "Project ${PROJECT} had no changes."
  exit 0
fi

# Update gcloud
gcloud --quiet components update
gcloud --quiet components install beta

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

#  run/websockets
export REDISHOST=$(cat $KOKORO_GFILE_DIR/secrets-memorystore-redis-ip.txt)
export REDISPORT=6379

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently. Defaults to 'latest'.
RAW_SAMPLE_VERSION="${KOKORO_GIT_COMMIT:-latest}"
export SAMPLE_VERSION="${RAW_SAMPLE_VERSION:0:15}"
export SAMPLE_NAME="$(basename $(pwd))"

# Cloud Run has a max service name length, $KOKORO_BUILD_ID is too long to guarantee no conflict deploys.
set -x
export SUFFIX="$(cat /dev/urandom | LC_CTYPE=C tr -dc 'a-z0-9' | head -c 15)"
set +x
export SERVICE_NAME="${SAMPLE_NAME}-${SUFFIX}"

# Install dependencies and run Nodejs tests.
export NODE_ENV=development
npm install

# Configure Cloud SQL variables for deploying idp-sql sample
export DB_NAME="kokoro_ci"
export DB_USER="kokoro_ci"
export DB_PASSWORD=$(cat $KOKORO_GFILE_DIR/secrets-sql-password.txt)
export CLOUD_SQL_CONNECTION_NAME=$(cat $KOKORO_GFILE_DIR/secrets-pg-connection-name.txt)

export IDP_KEY=$(gcloud secrets versions access latest --secret="nodejs-docs-samples-idp-key" --project="${GOOGLE_CLOUD_PROJECT}")

npm test
npm run --if-present system-test
