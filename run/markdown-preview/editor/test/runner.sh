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

set -eo pipefail;

requireEnv() {
  test "${!1}" || (echo "Environment Variable '$1' not found" && exit 1)
}
requireEnv SERVICE_NAME
requireEnv GOOGLE_CLOUD_PROJECT

# The markdown-preview sample needs to be tested with both the editor and renderer services deployed.
echo
echo '---'
echo ":: Deploy the Renderer service"
echo
pushd ../renderer

# Version is in the format <PR#>-<GIT COMMIT SHA>.
# Ensures PR-based triggers of the same branch don't collide if Kokoro attempts
# to run them concurrently.
export UPSTREAM_CONTAINER_IMAGE="gcr.io/${GOOGLE_CLOUD_PROJECT}/run-renderer:${SAMPLE_VERSION:-latest}"

# Build the Renderer service
set -x
gcloud builds submit --tag="${UPSTREAM_CONTAINER_IMAGE}"
set +x

# Assign the Renderer service container image.
export UPSTREAM_SERVICE_NAME="renderer-${SUFFIX:-manual}"

# Deploy the Renderer service.
FLAGS="--no-allow-unauthenticated" SERVICE_NAME=${UPSTREAM_SERVICE_NAME} CONTAINER_IMAGE=${UPSTREAM_CONTAINER_IMAGE} test/deploy.sh

# Assign the upstream Renderer service url.
export EDITOR_UPSTREAM_RENDER_URL=$(SERVICE_NAME=${UPSTREAM_SERVICE_NAME} test/url.sh)

echo
echo '---'
echo ":: Deploy the Editor service"
echo
popd

# Deploy the Editor service.
FLAGS="--set-env-vars EDITOR_UPSTREAM_RENDER_URL=$EDITOR_UPSTREAM_RENDER_URL" test/deploy.sh

# Assign the Editor service url.
export BASE_URL=$(SERVICE_NAME=${SERVICE_NAME} test/url.sh)
test -z "$BASE_URL" && echo "BASE_URL value is empty" && exit 1

# Assign an ID token for the Editor service.
export ID_TOKEN=$(gcloud auth print-identity-token)
test -z "$ID_TOKEN" && echo "ID_TOKEN value is empty" && exit 1

echo
echo '---'
echo

# Register post-test cleanup.
function cleanup {
  set -x
  gcloud run services delete ${SERVICE_NAME} \
    --platform=managed \
    --region="${REGION:-us-central1}" \
    --quiet
  gcloud run services delete ${UPSTREAM_SERVICE_NAME} \
    --platform=managed \
    --region="${REGION:-us-central1}" \
    --quiet

  # The upstream service is entirely managed in this script.
  # The editor service container image is managed externally.
  gcloud container images delete "${UPSTREAM_CONTAINER_IMAGE}" \
    --quiet 
}
trap cleanup EXIT

# Do not use exec to preserve trap behavior.
"$@"
