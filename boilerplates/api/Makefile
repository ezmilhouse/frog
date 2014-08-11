###############################################################################
###############################################################################
###############################################################################
### OPTIONS ###################################################################

# current directory
d = $(shell pwd)

# resource collection (always plural)
c = 'somethings'

# node process default environment
e = 'development'

# node process default port (development)
p = 2200

# node process default port (production)
r = 2210

# node process to run in cluster mode
u = false

# resource type
t = 'mongo'





###############################################################################
###############################################################################
###############################################################################
### NODE (LOCALLY) ############################################################
#
# @process start
# Starts node app in 'development' environment (as a semi-service, using
# nodemon) on specific port (defaults to 2200), optionally in cluster mode
# (defaults to false). Not to be used in production.
# @example make start e=[NODE_ENVIRONMENT] p=[NODE_PORT] c=[NODE_CLUSTER]
#          make start e=development p=2200 c=true
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





###############################################################################
###############################################################################
###############################################################################
### NODE (REMOTELY) ###########################################################
#
# @process process-start
# Starts node app in 'production' environment (as a service, using forever) on
# specific port (defaults to 2210). Not to be used in development.
# @example make process-start p=[NODE_PORT] c=[NODE_CLUSTER]
#          make process-start p=2210 c=true
#          make process-start
#
# @process process-stop
# Stops node app in 'production' environment, uses 0 key forever process by
# default.
# @example make process-stop
#          make process-stop
#
# @process process-restart
# Restarts node app in 'production' environment by calling 'make process-stop'
# and 'make process-start'.
# @example make process-restart
#          make process-restart
#
###############################################################################

process-start:
	# start process
	@forever start -s -p /home/fm/local/www/api/config --append -l /home/fm/local/www/api/logs/node.all.log -o /home/fm/local/www/api/logs/node.out.log -e /home/fm/local/www/api/logs/node.err.log --sourceDir /home/fm/local/www/api/htdocs frog.js --environment=production --port=$(r) --cluster=$(u)
	# ok

process-stop:
	# stop process
	@forever stop 0
	# ok

process-restart:
	# stop process
	@make process-stop
	# start process
	@make process-start
	# ok
