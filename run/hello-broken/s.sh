#!/bin/bash
find . -name '*.sh' -not -path "./testing/*" -exec shellcheck -f gcc {} \;
