
NODE_ENGINE ?= `which node nodejs`
NPM_ENGINE ?= `which npm`

all: build

setup:
	@@if test ! -z ${NODE_ENGINE}; then \
		if test ! -z ${NPM_ENGINE}; then \
			 npm install jake -g && npm install; \
		else \
			echo "You must have NPM installed in order to build Abacus"; \
		fi \
	else \
		echo "You must have NodeJS installed in order to build Abacus"; \
	fi

build:
	@@jake








.PHONY: all setup build
