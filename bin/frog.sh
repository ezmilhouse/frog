#!/bin/sh

FROG_CLUSTER=false
FROG_DIR=.
FROG_LOCAL=false
FROG_ENV="development"
FROG_PORT="4000"
FROG_REPO="/Users/ezmil/Workspace/var/www/frog"

case "$1" in

    create)

        # create working directory
        mkdir -p "$2"

        # change working directory
        pushd "$2"

        # create root level folders
        mkdir ./public
        mkdir ./public/support
        mkdir ./server

        # copy root files
        cp -rf ${FROG_REPO}/boilerplates/app/root/* .

        # copy ./public/* files
        cp -rf ${FROG_REPO}/boilerplates/app/public/* ./public

        # copy ./server/* files
        cp -rf ${FROG_REPO}/boilerplates/app/server/* ./server

        # fetch dependencies
        npm install

        # link frog into (public) support folder
        ln -s ${FROG_REPO} ./public/support/frog

        # link frog into (server) node_modules folder
        ln -s ${FROG_REPO} ./node_modules/frog

        # link proprietary misc.text.js to the server
        ln -s ${PWD}/public/js/misc/misc.text.js ./server/js/misc/misc.text.js

        # change working directory (back to script context)
        popd

    ;;


    # frog
    # frog .
    # frog path/to/app
    *)

        # overwrite FROG_DIR, if incoming
        if [ "$1" ]; then
            FROG_DIR="$1"
        fi

        # check for directory, should exist in path FROG_DIR
        if [ ! -d "${FROG_DIR}" ]; then
            echo "[o_O] application at ${FROG_DIR} not found"
            exit 1
        fi

        echo ${FROG_DIR}

        # change working directory
        pushd ${FROG_DIR}

        # start frog application
        nodemon frog.js -e=${FROG_ENV} -p=${FROG_PORT} -u=${FROG_CLUSTER} -L=${FROG_LOCAL}

        # change working directory (back to script context)
        popd

    ;;

esac