# Makefile for running typical developer workflow actions.
# To run actions in a subdirectory of the repo:
#   make lint build dir=translate/snippets

INTERFACE_ACTIONS="build test lint"

.ONESHELL: #ease subdirectory work by using the same subshell for all commands
.-PHONY: *

# Default to current dir if not specified.
dir ?= $(shell pwd)

export GOOGLE_CLOUD_PROJECT = ${GOOGLE_SAMPLES_PROJECT}

build:
	npm install
	cd ${dir}
	npm install
	npm run build --if-present

test: check-env build
	cd ${dir}
	npm test

lint: build
	cd ${dir}
	npx gts fix
	npx gts lint

check-env:
ifndef GOOGLE_SAMPLES_PROJECT
	$(error GOOGLE_SAMPLES_PROJECT environment variable is required to perform this action)
endif

list-actions:
	@ echo ${INTERFACE_ACTIONS}

