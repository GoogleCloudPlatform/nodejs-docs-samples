#!/usr/bin/env bash

# Copyright 2020 Google LLC.
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

# Navigate to the Renderer folder
pushd ../renderer

# Install dependencies
npm install

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently.
export UPSTREAM_SAMPLE_VERSION="${KOKORO_GIT_COMMIT:-latest}"
export UPSTREAM_SAMPLE_NAME="renderer"

# Builds not triggered by a PR will fall back to the commit hash then "latest".
SUFFIX=${KOKORO_BUILD_ID}
export UPSTREAM_SERVICE_NAME="${UPSTREAM_SAMPLE_NAME}-${SUFFIX}"
export UPSTREAM_CONTAINER_IMAGE="gcr.io/${GOOGLE_CLOUD_PROJECT}/run-${UPSTREAM_SAMPLE_NAME}:${UPSTREAM_SAMPLE_VERSION}"

# Build the service
set -x
gcloud builds submit --tag="${UPSTREAM_CONTAINER_IMAGE}"
set +x
