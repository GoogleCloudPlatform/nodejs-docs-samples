#!/bin/bash

# Copyright 2019 Google LLC
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

# CONFIGURATION
CHECKED_PKG_NAME="@google-cloud/(\w|\\-)+"
EXCLUSION_COMMENT="kokoro-allow-mock"

# Get imports
allImports=$(grep -sHoE "\W+${CHECKED_PKG_NAME}(.*${EXCLUSION_COMMENT})?" **/*.test.js --exclude=node_modules)
sysImports=$(grep -sHoE "require\\(\W${CHECKED_PKG_NAME}(.*${EXCLUSION_COMMENT})?" **/*.test.js --exclude=node_modules)
sysImports=$(echo $sysImports | sed s/require//g)

# Ignore excluded imports
allImports=$(echo $allImports | grep -v ${EXCLUSION_COMMENT}); 
sysImports=$(echo $sysImports | grep -v ${EXCLUSION_COMMENT});

# Remove filenames (but not directories)
allImports=$(echo $allImports | awk -F '[/:]' '{ OFS="/"; if ($NF>2) { $(NF-2)=""; $(NF-3)=""; } print }'); # [[:space:]]
sysImports=$(echo $sysImports | awk -F '[/:]' '{ OFS="/"; if ($NF>2) { $(NF-2)=""; $(NF-3)=""; } print }');

# Remove excess whitespace + other cruft
allImports=$(echo $allImports | sed -e "s/[^0-9a-zA-Z]*@/:@/g")
sysImports=$(echo $sysImports | sed -e "s/[^0-9a-zA-Z]*@/:@/g")

# Convert to library lists + dedupe
allLibs=$(echo $allImports | egrep -s $CHECKED_PKG_NAME | sort | uniq)
sysLibs=$(echo $sysImports | egrep -s $CHECKED_PKG_NAME | sort | uniq)

# Check equality
errCode=0
for lib in $allLibs
do
	if ! echo $sysLibs | grep -q "$lib"; then
		echo "No system tests (or missing $EXCLUSION_COMMENT comment): ${lib}"
		errCode=1
	fi
done

#exit $errCode