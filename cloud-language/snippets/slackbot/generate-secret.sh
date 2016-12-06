#!/bin/bash
# Copyright 2016 Google Inc. All Rights Reserved.
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

if [[ $# -ne 1 ]] ; then
  echo "Your slack token must be specified."
  echo "Usage:" >&2
  echo "  ${0} MY-SLACK-TOKEN" >&2
  exit 1
fi

token=$1
token_base64=$(python -c "import base64; print base64.b64encode(\"${token}\")")

cat <<END > slack-token-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: slack-token
type: Opaque
data:
  slack-token: ${token_base64}
END
