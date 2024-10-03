# Makefile for running typical developer workflow actions.
# To run actions in a subdirectory of the repo:
#   make lint build dir=translate/snippets

INTERFACE_ACTIONS="build test lint"

.ONESHELL: #ease subdirectory work by using the same subshell for all commands
.-PHONY: *

# Default to current dir if not specified.
dir ?= $(shell pwd)

export GOOGLE_CLOUD_PROJECT = ${GOOGLE_SAMPLES_PROJECT}

install:
	# Install root package dependencies, this incldues packages for testing.
	npm install

	# Install the code sample dependencies.
	cd ${dir}
	npm install

build: install
	npm run build --if-present

test: check-env build
	cd ${dir}
	npm test

e2e-test: check-env build
	cd ${dir}
	npm run system-test

lint: install
	npx gts fix
	npx gts lint

check-env:
ifndef GOOGLE_SAMPLES_PROJECT
	$(error GOOGLE_SAMPLES_PROJECT environment variable is required to perform this action)
endif

list-actions:
	@ echo ${INTERFACE_ACTIONS}

