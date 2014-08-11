###############################################################################
###############################################################################
###############################################################################
### OPTIONS ###################################################################

# current directory
d = $(shell pwd)

# test folder
f = $(shell pwd)/tests





###############################################################################
###############################################################################
###############################################################################
### BUILDS ####################################################################
#
# @process build
# Builds new version of the SDK.
# @example make build
#
# @process build-init
# Installs build dependencies, runs build.
# @example make build-init
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
### TESTS #####################################################################
#
# @process test
# Runs all SDK tests.
# @example make test
#
# @process test-init
# Installs test dependencies, runs test.
# @example make test-init
#
###############################################################################

test:
	@mocha -u tdd -R spec $(f)
	# ok

test-init:
	@echo 'initializing tests ...'
	@npm install && sudo npm install mocha -g
	@echo 'initializing tests ... ok!'
	# run tests
	@make test
	# ok