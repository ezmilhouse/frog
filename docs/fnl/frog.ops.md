make sh script executable

$ chmod +x

Layout

├── etc
│   └── elasticsearch
│   │   └── *.conf
│   └── mongodb
│   │   └── *.conf
│   └── nginx
│   │   └── *.conf
│   └── node
│   │   └── *.conf
├── usr
│   ├── local
│   │   └── bin
│   │   └── elasticsearch
│   │   └── mongodb
│   │   └── nginx
│   │   └── node
├── var
│   └── auth
│   │   └── *.htpasswd
│   └── certs
│   │	└── *.pem
│   └── elasticsearch
│   └── log
│   │	└── elasticsearch
│   │	│	└── *.log
│   │	└── mongodb
│   │	│	└── *.log
│   │	└── nginx
│   │	│	└── *.log
│   │	└── node
│   │	│	└── *.log
│   └── mongodb
│   └── nginx
│   └── node
│   └── www
│   │	└── [PROJECT]
│   │   │	└── auth
│   │   │	│	└── *.htpasswd 	=> /var/auth/*.htpasswd
│   │   │	└── conf
│   │   │	│	└── *.conf 		=> /etc/[APPLICATION]/*.conf
│   │   │	└── htdocs
│   │   │	└── log
│   │   │	│	└── *.log 		=> /var/log/node

BASH

NAVIGATE DIRECTORIES
$ cd 		// back home
$ cd ..		// one up
$ cd -		// back to previous directory

CREATE DIRECTORIES
$ mkdir tmp			// create dir
$ mkdir -p tmp/test	// create dir recursively

COPY
$ cp -R -n origin destination	// -R subtree from this point, -n do not overwrite existing file

INSTALL SOFTWARE: ALL USERS
$ /usr/local		// application folders
$ /usr/local/bin	// application binaries

INSTALL SOFTWARE: LOCAL USER /~
$ /Users/[USERNAME]	// or cd  

BASH PROFILE

EDIT (in /~)
$ cd
$ nano .bash_profile

RELOAD (in /~)
$ cd
$

HOST
Add local hosts by editing the `hosts` file in Mac OS X, add IP/TLD pairs to access local hosts in the browser, if it doesn't work immediately after saving, flush the host cache.

EDIT HOSTFILE
$ sudo nano /private/etc/hosts

FLUSH CACHE AFTER HOSTFILE
$ dscacheutil -flushcache; sudo killall -HUP mDNSResponder

MONGO DB

INSTALL
$ mkdir -p /usr/local/tmp
$ cd /usr/local/tmp
$ curl -O http://downloads.mongodb.org/osx/mongodb-osx-x86_64-2.6.4.tgz
$ tar -zxvf mongodb-osx-x86_64-2.6.4.tgz
$ cp -R -n mongodb-osx-x86_64-2.6.4/ mongodb

CLI
$ mongo

# DOCKER 101

├── Docker
│   ├── Dockerfile
│   ├── nginx
│   │   └── default
│   ├── mongodb
│   │   └── default.conf
│   └── node
│       └── default.conf
├── Vagrantfile
└── www
    └── index.js
    └── ...

BOOT2DOCKER

Mac OS X MOUNTING PROBLEMS
The problem with the boot2docker VM is, that Docker is trying to mount the local path from the host into our container, but the host is boot2docker, not OS X. boot2docker doesn’t know anything about files on OS X. 

Mount OS X’s /Users directory into the VM.

By mounting /Users into our VM, boot2docker gains a /Users volume that points to the same directory on OS X. Referencing /Users/Chris/web inside boot2docker now points directly to /Users/Chris/web on OS X, and we can mount any path starting with /Users into our container. Pretty neat.

boot2docker doesn’t support the VirtualBox Guest Additions that allow us to make this work. Fortunately, a very smart person has solved this problem for us with a custom build of boot2docker containing the Guest Additions and the configuration to make this all work. We just have to install it.

$ curl http://static.dockerfiles.io/boot2docker-v1.2.0-virtualbox-guest-additions-v4.3.14.iso > ~/.boot2docker/boot2docker.iso
$ VBoxManage sharedfolder add boot2docker-vm -name home -hostpath /Users
$ boot2docker up

DOCKER

QUICKSTART

$ docker run -d -p 80:80 --name=nginx local/ubuntu-nginx
$ docker run -d --name=mongodb local/ubuntu-mongodb
$ docker run -d -p 2000:2000 --name=node --link mongodb:mongodb -v /Users/mfu/brnfck/test/www/project-node/htdocs:/var/www/project-node/htdocs local/ubuntu-node

oder

$ docker run --rm -t -i -p 2000:2000 --name=node --link mongodb:mongodb -v /Users/mfu/brnfck/test/www/project-node/htdocs:/var/www/project-node/htdocs local/ubuntu-node /bin/bash

oder 

$ docker run --rm --name=node1 --link mongodb:mongodb local/ubuntu-node env
$ docker run -t -i -v /var/data/mongodb --rm --name=mongodb-data local/busybox-data /bin/sh



MAC OS X: INIT
$ /usr/local/bin/boot2docker start
$ export DOCKER_HOST=tcp://192.168.59.103:2375
$ docker info

# if you need to find out the boot2docker ip
$ boot2docker ip

If you already added export to your bash script, just run:
$ docker info

# show version
$ docker version

IMAGES
# build
$ docker build -t="user/tag" --force-rm=false .

# build: options
--force-rm	always remove intermediate images, even after unsuccessful builds
--no-cache  does not cache builds if set to `true`
-t			tag to be applied to the resulting image only, in case of success, unsuccessful builds 			result in untagged (<none>) images 

# remove untagged images
$ docker rmi -f $(docker images -a | grep '^<none>' | awk '{print $3}')

CONTAINERS
# inspect
# containers low-level configuration
$ docker inspect [CONTAINER]

# logs
# see container's STDOUT 
$ docker logs [CONTAINER]

# tail container's STDOUT
$ docker logs -f [CONTAINER]

# ps
# show list of running containers
$ docker ps

# show all containers
$ docker ps -a

# rm
# remove container(s)
$ docker rm [CONTAINER] [CONTAINER] [CONTAINER]

# remove all containers
$ docker ps -a -q | xargs -n 1 -I {} docker rm {}

# remove all exited containers
$ docker ps -a | grep Exit | cut -d ' ' -f 1 | xargs docker rm

# run
# run container (with port mapping, as daemon)
$ docker run -d -p 80:80 --name=nginx --rm local/ubuntu-nginx

# run container (with port mapping)
$ docker run -t -i -p 80:80 --name=nginx --rm user/tag /bin/bash 

# run container to lookup `env` variables of a source container in a --link(ed) setting
$ docker run --rm --name=node1 --link mongodb:mongodb local/ubuntu-node env

# run: env
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOSTNAME=8456414d86bb
MONGODB_PORT=tcp://172.17.0.115:27017
MONGODB_PORT_27017_TCP=tcp://172.17.0.115:27017
MONGODB_PORT_27017_TCP_ADDR=172.17.0.115
MONGODB_PORT_27017_TCP_PORT=27017
MONGODB_PORT_27017_TCP_PROTO=tcp
MONGODB_NAME=/node1/mongodb
HOME=/root

# run: options
-d 			run as daemon (in the background)
-e 			sets environment variable, can be used, multiple times, vars accessable via $MYVAR1, 			$MYVAR2 - is executed after --env-file, so you can overwrite settings here
--env-file	sets environment variables based on file contents
-i 			interactive, keep STDIN open
--link		links one container to another, takes the form of name:alias (name is the container to 			be linked to, alias is the name you want to use for reference (in the linked 			container)), when linking to containers the source container (ex. you database) does 			not have to expose ports, --link creates a secure tunnel between both of the 			containers - that is a huge benefit, ex. you database is not exposed to the network, 			when --link(ing) docker adds a host entry for the source container
--name		running containers get random names by default, ex. `cocky_leakey`, you can set the 			name yourself using the --name=NAME option
-P 			publish all container ports to host
-p 80:80	publish specific container ports to host, -p flag can be used multiple times to expose 			multiple ports
--rm		setting the --rm flag will remove the container immediately after it stopped, helps to 			keep you system clean
-t			opens container's terminal (necessary to run shell, ex: /bin/bash)
-v			add data volume to container, you can use -v multiple times, btw same as useing the 			VOLUME instruction in a Dockerfile, there are two ways to use -v:
			1. add volume in container: -v local
			ex: -v /var/www
			In this case docker will create a directory in your hosts `/var/lib/docker/volumes` 			directory, will be deleted if no container is using it anymore.
			2. add volume in container and mount a directory from host, -v local:container, local 			folders have to have the form of absoluet paths, this option is not available in the 			Dockerfile (because it's specific to one local environment only) 
			ex: -v /Users/mfu/brnfck/test/www/project-node:/var/www

# stop, kill
# stop container
$ docker stop [CONTAINER]

# kill container
$ docker kill [CONTAINER]

# top
# get basic top information about container
$ docker top [CONTAINER]