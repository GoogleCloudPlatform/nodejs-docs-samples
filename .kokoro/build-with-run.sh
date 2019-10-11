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

export GOOGLE_CLOUD_PROJECT=nodejs-docs-samples-tests
pushd github/nodejs-docs-samples/${PROJECT}

# Update gcloud
gcloud --quiet components update
gcloud --quiet components install beta

# Configure gcloud
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GOOGLE_CLOUD_PROJECT

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently.
export SAMPLE_VERSION="${KOKORO_GIT_COMMIT:-latest}"
export SAMPLE_NAME="$(basename $(pwd))"

# Temporary: Verify available environment variables.
env

# Builds not triggered by a PR will fall back to the commit hash then "latest".
SUFFIX=${KOKORO_GITHUB_PULL_REQUEST_NUMBER:-${SAMPLE_VERSION:0:12}}
export SERVICE_NAME="${SAMPLE_NAME}-${SUFFIX}"
export CONTAINER_IMAGE="gcr.io/${GOOGLE_CLOUD_PROJECT}/run-${SAMPLE_NAME}:${SAMPLE_VERSION}"

# Register post-test cleanup.
function cleanup {
  gcloud --quiet container images delete "${CONTAINER_IMAGE}" || true
}
trap cleanup EXIT

# Build the service
set -x
gcloud builds submit --tag="${CONTAINER_IMAGE}"
set +x

# Install dependencies and run Nodejs tests.
export NODE_ENV=development
npm install
npm test
npm run --if-present e2e-test
