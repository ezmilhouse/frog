###############################################################################
###############################################################################
###############################################################################
### OPTIONS ###################################################################

# current directory
d = $(shell pwd)

# default environment
e = development

# test folder
f = $(shell pwd)/tests

# application name (lowercase, alpha)
n = frog-app

# default port
p = 2500

# default cluster mode setting
u = false

# default config.local setting
l = true





###############################################################################
###############################################################################
###############################################################################
### BUILDS ####################################################################
#
# @process build
# Builds new version of the SDK.
# @example
# $ make build
#
# @process build-init
# Installs build dependencies, runs build.
# @example
# $ make build-init
#
###############################################################################

build:
	# run tests
	@make tests-unit
	# building
	@grunt
	# pushing
	@git add --all :/
	@git commit -m 'release ...'
	@git push origin develop
	@git checkout master
	@git merge develop
	@git push origin master
	@git checkout develop
	# ok

build-init:
	# installing global grunt
	@sudo npm install grunt -g
	# installing local grunt
	@npm install grunt
	# build
	@make build
	# ok





###############################################################################
###############################################################################
###############################################################################
### APP #######################################################################
#
# @process app
# Creates new frog application.
#
# @prepare
# $ mkdir -p www/public/support
# $ git clone --recursive git@github.com:ezmilhouse/frog.git www/public/support/frog
# $ cp www/public/support/frog/Makefile www/Makefile
# $ cd www
#
# @example
# $ make frog
#
###############################################################################

frog-setup:
	@cp -rf public/support/frog/boilerplates/app/root/* .
	@cp -rf public/support/frog/boilerplates/app/support/* public/support
	@cp -rf public/support/frog/boilerplates/app/public/* public
	@rm -rf server
	@mkdir server
	@cp -rf public/support/frog/boilerplates/app/server/* server
	@npm install
	@cd node_modules && rm -rf frog
	@cd node_modules && ln -s $(shell pwd)/public/support/frog
	@cd server/js/misc && ln -s $(shell pwd)/public/js/misc/misc.text.js
	@mv config.development.js config.local.js
	@mv public/config.development.js public/config.local.js

frog-start:
	nodemon frog.js -e=$(e) -p=$(p) -u=$(u) -l=$(l)





###############################################################################
###############################################################################
###############################################################################
### TESTS #####################################################################
#
# @process test
# Runs all SDK tests.
# @example
# $ make test
#
# @process test-init
# Installs test dependencies, runs test.
# @example
# $ make test-init
#
###############################################################################

test:
	@mocha -u tdd -R spec $(f)

test-init:
	@echo 'initializing tests ...'
	@npm install && sudo npm install mocha -g
	@echo 'initializing tests ... ok!'
	# run tests
	@make test