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
deleteIfFound() {
  echo "running: $1"
  $($1 > /dev/null)
  if [ $? -eq 0 ]; then
    echo "running: $2"
    $($2 > /dev/null)
  fi
}

# Define max retries
max_attempts=3;
attempt_num=1;

arg1="$1"
arg2="$2"

if [ $# -eq 1 ]
then
  cmd="$arg1"
else
  cmd="deleteIfFound \"$arg1\" \"$arg2\""
fi

echo $cmd

until eval $cmd
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


