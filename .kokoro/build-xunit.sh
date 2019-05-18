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

# Setup
cd github/nodejs-docs-samples/${PROJECT}
export GOOGLE_APPLICATION_CREDENTIALS=${KOKORO_GFILE_DIR}/secrets-key.json
gcloud auth activate-service-account --key-file "$GOOGLE_APPLICATION_CREDENTIALS"
gcloud config set project $GCLOUD_PROJECT

if [ ! -f './.mocharc.yml' ]
then

# Note: since this a "heredoc", it must be un-indented
cat << REPORTER > .mocharc.yml
reporter: xunit
reporter-option:
  - output=./test.xml
REPORTER
fi

# Run build script + capture exit code
sh build.sh
CODE=$?

# Store XUnit configs
export XUNIT_BUCKET="nodejs-docs-samples-kokoro-test"
gsutil cp ./test.xml gs://${XUNIT_BUCKET}/test_${KOKORO_BUILD_ID}.xml

# Return captured code
exit $CODE