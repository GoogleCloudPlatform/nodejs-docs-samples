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

echo '---'
test/deploy.sh

echo
echo '---'
echo

# Register post-test cleanup.
# Only needed if deploy completed.
function cleanup {
  set -x
  gcloud run services delete ${SERVICE_NAME} \
    --platform=managed \
    --region="${REGION:-us-central1}" \
    --quiet
}
trap cleanup EXIT

# TODO: Perform authentication inside the test.
export ID_TOKEN=$(gcloud auth print-identity-token)
export BASE_URL=$(test/url.sh)

test -z "$BASE_URL" && echo "BASE_URL value is empty" && exit 1

# Do not use exec to preserve trap behavior.
"$@"
