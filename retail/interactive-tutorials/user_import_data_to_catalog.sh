#!/bin/bash

# Copyright 2022 Google Inc.
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

# set the key as GOOGLE_APPLICATION_CREDENTIALS
{
  export GOOGLE_APPLICATION_CREDENTIALS=~/key.json

  # Create a GCS bucket and upload the product data to the bucket
  cd ~/cloudshell_open/nodejs-docs-samples/retail
  output=$(node ~/cloudshell_open/nodejs-docs-samples/retail/interactive-tutorials/setup/create-gcs-bucket.js)

  # Get the bucket name and store it in the env variable BUCKET_NAME
  temp="${output#*Bucket }"
  bucket_name="${temp% created*}"
  export BUCKET_NAME=$bucket_name

  # Import products to the Retail catalog
  node ~/cloudshell_open/nodejs-docs-samples/retail/interactive-tutorials/product/import-products-gcs.js
} && {
  echo "====================================="
  echo "Your Retail catalog is ready to use!"
  echo "====================================="
} || {
  echo "================================================================"
  echo "Your Retail catalog wasn't created! Please fix the errors above!"
  echo "================================================================"
}
