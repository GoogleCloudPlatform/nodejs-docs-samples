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
requireEnv CONTAINER_IMAGE

# Deploy the service
set -x
gcloud run deploy "${SERVICE_NAME}" \
  --image="${CONTAINER_IMAGE}" \
  --region="${REGION:-us-central1}" \
  ${FLAGS} \
  --platform=managed \
  --quiet
set +x

echo 'Cloud Run Links:'
echo "- Logs: https://console.cloud.google.com/logs/viewer?project=${GOOGLE_CLOUD_PROJECT}&resource=cloud_run_revision%2Fservice_name%2F${SERVICE_NAME}"
echo "- Console: https://console.cloud.google.com/run/detail/${REGION:-us-central1}/${SERVICE_NAME}/metrics?project=${GOOGLE_CLOUD_PROJECT}"
