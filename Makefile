# Makefile for running typical developer workflow actions.
# To run actions in a subdirectory of the repo:
#   make lint build dir=translate/snippets

INTERFACE_ACTIONS="build test lint"

.ONESHELL: #ease subdirectory work by using the same subshell for all commands
.-PHONY: *

# Default to current dir if not specified.
dir=${dir:-.}

GOOGLE_CLOUD_PROJECT="${GOOGLE_SAMPLE_PROJECT}"

build:
	cd ${dir}
	npm install
	npm run build --if-present

test: check-env build
	cd ${dir}
	npm test

# TODO: check in w/ pattishin@ for consistent linting and/or fixing behavior.
# Use the toplevel eslint config, for consistent linting practices across the repo.
lint:
	npx eslint --config .eslintrc.json ${dir}

check-env:
ifndef GOOGLE_SAMPLE_PROJECT
	$(error GOOGLE_SAMPLE_PROJECT environment variable is required to perform this action)
endif

list-actions:
	@ echo ${INTERFACE_ACTIONS}
