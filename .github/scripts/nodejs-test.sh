# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

set -e # exit on error
set -x # print commands as they are executed

package=$1

if [ -z $package ]; then
  echo "a package to test is required"
  exit 1
fi

if [ -z $GOOGLE_SAMPLES_PROJECT ]; then
  echo "GOOGLE_SAMPLES_PROJECT environment variable is required"
  exit 1
fi

# Install the package dependencies.
cd $package
npm install || true
npm run build --if-present

# Run the tests.
npm test
