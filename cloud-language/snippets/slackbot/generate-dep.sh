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
  echo "Your project ID must be specified."
  echo "Usage:" >&2
  echo "  ${0} my-cloud-project" >&2
  exit 1
fi
cloud_project=$1

cat <<END > slack-bot-dep.yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: slackbotstore
spec:
  capacity:
    storage: 20Gi
  accessModes:
    - ReadWriteOnce
  gcePersistentDisk:
    pdName: slackbotstore
    fsType: ext4
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: sb-pv-claim
  labels:
    name: slack-bot
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 20Gi
---
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: slack-bot
spec:
  replicas: 1
  template:
    metadata:
      labels:
        name: slack-bot
    spec:
      containers:
      - name: master
        image: gcr.io/${cloud_project}/slack-bot
        volumeMounts:
        - name: slack-token
          mountPath: /etc/slack-token
        - name: slackbot-persistent-storage
          mountPath: /var/sqlite3
        env:
        - name: SLACK_TOKEN_PATH
          value: /etc/slack-token/slack-token
        - name: GCLOUD_PROJECT
          value: ${cloud_project}
      volumes:
      - name: slack-token
        secret:
          secretName: slack-token
      - name: slackbot-persistent-storage
        persistentVolumeClaim:
          claimName: sb-pv-claim
END
