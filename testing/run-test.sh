#!/bin/bash
#
# Copyright 2022 Google LLC
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


# `-e` enables the script to automatically fail when a command fails
# `-o pipefail` sets the exit code to the rightmost comment to exit
# with a non-zero
set -eo pipefail

if [ ${BUILD_TYPE} == "presubmit" ]; then

    # For presubmit build, we want to know the difference from the
    # common commit in origin/main.
    GIT_DIFF_ARG="origin/main..."

    # Then fetch enough history for finding the common commit.
    git fetch origin main --deepen=200

elif [ ${BUILD_TYPE} == "continuous" ]; then
    # For continuous build, we want to know the difference in the last
    # commit. This assumes we use squash commit when merging PRs.
    GIT_DIFF_ARG="HEAD~.."

    # Then fetch one last commit for getting the diff.
    git fetch origin main --deepen=1

else
    # Run everything.
    GIT_DIFF_ARG=""
fi

if [ -n ${GIT_DIFF_ARG} ]; then
  echo "running git diff ${GIT_DIFF_ARG} *"
  git diff ${GIT_DIFF_ARG} *
fi
