###############################################################################
###############################################################################
###############################################################################
### OPTIONS ###################################################################

# current directory
d = $(shell pwd)

# node process default environment
e = development

# node process default port (development)
p = 2300

# node process default port (production)
r = 2310

# node process to run in cluster mode
u = false

# local configuration file
l = true





###############################################################################
###############################################################################
###############################################################################
### NODE (LOCALLY) ############################################################
#
# @process start
# Starts node app in 'development' environment (as a semi-service, using
# nodemon) on specific port (defaults to 2300), optionally in cluster mode
# (defaults to false). Not to be used in production.
# @example make start e=[NODE_ENVIRONMENT] p=[NODE_PORT] c=[NODE_CLUSTER]
#          make start e=development p=2300 c=true
#          make start
#
# @process test
# Starts tests in 'development' environment, requires a running node app in
# 'development' environment also.
# @example make test
#          make test
#
###############################################################################

init:
	@npm install
	@sudo npm install nodemon
	# ok

start:
	@nodemon frog.js -e=$(e) -p=$(p) -u=true -l=$(l)
	# ok

start-single:
	@nodemon frog.js -e=$(e) -p=$(p) -u=false -l=$(l)
	# ok

start-node:
	@node frog.js -e=$(e) -p=$(p) -u=false -l=$(l)
	# ok

test:
	@env TEST_ENV=development mocha -u tdd -R spec tests/cases
	# ok

test-init:
	@sudo npm install mocha -g
	@make test
	# ok

