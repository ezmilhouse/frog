#	VAGRANT

##	INSTALL (on Mac OS X)

	- download Mac OS X installer
	https://www.vagrantup.com/downloads.html

#  	DOCKER

## 	BUILD

	# clean build, no artefacts in case of failure
	$ docker build --force-rm=true --no-cache=true -t local/ubuntu-node .

##	RUN

	# trash runtime
	$ docker run -t -i --rm local/ubuntu-nginx

	# trash runtime on a port
	$ docker run -t -i -p 80:80 --rm local/ubuntu-nginx


##	IMPORTANT NOTES, DISCOVERIES (in random order)

	- the mount feature (-v local:container) does not work on Mac (it's Linux only), there is a workaround using a modified boot2docker image - feels clunky

	- the number of commands in a Dockerfile is limited to 127 layers, therefore use RUN / a lot
	https://docs.docker.com/userguide/dockerimages/

	- while working with docker you will run into the `upstart` problem - Some apt packages, ex. mongodb – will try and start themselves up as services, the way they normally do on Linux systems, upstart and init.d services do not work inside Docker containers so we need to essentially neuter the binary responsible for this, usually you have to edit their config file by adding something similar to DAEMON=OFF

	- containers have an internal network and an IP address, use `docker inspect` to get an overview of a container's current network configuration

	- be aware of the different ways on how you can use the -p flag, you can avoidbeing constrained to only one container on a specific port, see https://docs.docker.com/userguide/dockerlinks/

	- if using mongodb, use a --link(ed) scenario, in node use interna IP expose by ... env to connect to database, run database container without exposing IP to the network.

	- data volumes persist ONLY until no containers use them

	- if running nodemon in a mounted folder (via -v local:container) then you should use the -L flag, otherwise it does not work (means: does not restart after changes)

	- while you have to run a command when you start up a container (with `run`), it doesn't really matter what the command is. It can even be a command that essentially does nothing, as ex: `true`.

	- you don't have to daemonize a data-only container by passing the -d option. In fact, the docker container exits immediately (after running ex: `true`), but even so, it is still usable as a data volume, even in a stopped state

##  INSTALL VAGRANT 

	$ vagrant plugin install vagrant-vbguest
	$ sudo ln -s /opt/VBoxGuestAdditions-4.3.10/lib/VBoxGuestAdditions /usr/lib/VBoxGuestAdditions

## 	INSTALL (on Mac OS X)

	- download Mac OS X installer, follow instructions
	  http://docs.docker.com/installation/mac/	

	  // init, start docker VM
	  $ boot2docker init
	  $ boot2docker start

	  // update bash profile, refresh
	  $ nano ~/.bash_profile
	  $ . ~/.bash_profile
















