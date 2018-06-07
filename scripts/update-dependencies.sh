#!/bin/bash

# Copyright 2017 Google Inc. All rights reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# For all directories containing a package.json file that aren't in a "node_modules" folder:
#   Update dependencies in package.json (ncu -u)
#   If no files in that directory have changed, skip it (! git diff --quiet --exit-code .)
#   Update dependencies in node_modules (yarn upgrade)
#   Run tests, and skip that directory if they fail (yarn test -- --fail-fast)
#   If the directory has not been skipped, add 'yarn.lock' and 'package.json' to the current commit
find . -name "package.json" -not -path "*/node_modules/*" -execdir sh -c "ncu -u && ! git diff --quiet --exit-code . && npm install && npm test && git add package.json" \;

# Note: this script deliberately avoids including broken dependencies.