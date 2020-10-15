#!/bin/bash
##
# retry.sh
# Provides utility functions commonly needed across Cloud Build pipelines.
#
# Usage
#
# ```
# ./retry/sh "gcloud RESOURCE EXISTS?" "gcloud ACTION"
# ```
##

# Usage: try "cmd1" "cmd2"
# If first cmd executes successfully then execute second cmd
try() {
  echo "running: $1"
  $($1 > /dev/null)
  if [ $? -eq 0 ]; then
    echo "running: $2"
    $($2 > /dev/null)
  fi
}


cmd1="$1"
cmd2="$2"
max_attempts=3;
attempt_num=1
until try "$cmd1" "$cmd2"
do
    if ((attempt_num==max_attempts))
    then
        echo "Attempt $attempt_num / $max_attempts failed! No more retries left!"
        exit
    else
        echo "Attempt $attempt_num / $max_attempts failed!"
        sleep $((attempt_num++))
    fi
done



