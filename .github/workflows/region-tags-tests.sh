#!/bin/bash

# Copyright 2018 Google LLC.
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

set -x

# Display link to docs
echo '================================================================='
echo -e 'Test failing? See \e[36mgo/drift-test-tracker-onboarding\e[0m for more info!'
echo '================================================================='

# Fetch XUnit CI enforcer script
#  curl-ing it ensures we get the latest version
curl "https://raw.githubusercontent.com/GoogleCloudPlatform/repo-automation-playground/master/xunit-ci-enforcer/region_tag_enforcer.sh" > enforcer.sh
chmod +x enforcer.sh

# Run enforcer on appropriate directories
STATUS=0

#  Functions
DIRS_LIST_FUNCTIONS=$(find functions -type d -name "*est" -not -path "*/node_modules/*" | xargs -I @ dirname @)
./enforcer.sh $DIRS_LIST_FUNCTIONS || STATUS=$?

#  App Engine
DIRS_LIST_APPENGINE=$(find appengine -type d -name "*est" -not -path "*/node_modules/*" | xargs -I @ dirname @)
./enforcer.sh $DIRS_LIST_APPENGINE || STATUS=$?

# Fail if any directory-label attempts failed
exit $STATUS
