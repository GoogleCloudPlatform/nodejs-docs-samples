#!/usr/bin/env bash
##
# retry.sh
# Provides utility functions commonly needed across Cloud Build pipelines.
#
# Usage
#
# ```
# . /workspace/test/retry.sh
# retry "gcloud RESOURCE EXISTS?" "gcloud ACTION"
# ```
##

retry() {
  local -r cmd1="$1"
  local -r cmd2="$2"
  local -i max_attempts=3;
  local -i attempt_num=1
  until try "$cmd1" "$cmd2"
  do
      if ((attempt_num==max_attempts))
      then
          echo "Attempt $attempt_num / $max_attempts failed! No more retries left!"
          return 1
      else
          echo "Attempt $attempt_num / $max_attempts failed!"
          sleep $((attempt_num++))
      fi
  done
}

try() {
  echo "running: " "$1"
  $($1 > /dev/null)
  if [ $? -eq 0 ]; then
    echo "running: " "$2"
    $($2)
  fi
}
