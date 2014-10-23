#!/bin/sh

FROG_CLUSTER=false
FROG_DIR=.
FROG_LOCAL=false
FROG_ENV="development"
FROG_PORT="4000"
FROG_REPO="/Users/ezmil/Workspace/var/www/frog"
FROG_COMP_REPO="git@github.com:ezmilhouse/frog-components"
FROG_TYPE="http" # http, rest
FROG_TESTS=true

case "$1" in

    # frog add path/to/app component-name
    # frog add path/to/app component-name new-component-name
    add)

        # required: path
        if [ ! "$2" ] ; then
            echo "[o_O] missing path to application"
            exit 1
        fi

        # required: component
        if [ ! "$3" ] ; then
            echo "[o_O] missing component"
            exit 1
        fi

        # set component name
        FROG_COMP_NAME=$3
        if [ "$4" ] ; then
            FROG_COMP_NAME=$4
        fi

        # build component path
        FROG_COMP_DIR="./public/components/$FROG_COMP_NAME"

        # check for directory, should not exist yet
        if [ -d "${FROG_COM_DIR}" ]; then
            echo "[o_O] component already exists"
            exit 1
        fi

        # change working directory
        pushd "$2"

        # remove tmp directory if already there
        if [ -d "./tmp" ]; then
            rm -rf ./tmp
        fi

        # create tmp directory
        mkdir tmp

        # checkout components
        git clone ${FROG_COMP_REPO} ./tmp/components

        # create target directory
        mkdir -p ${FROG_COMP_DIR}

        # copy component
        cp -rf ./tmp/components/$3/* ${FROG_COMP_DIR}

        # change working directory (back to script context)
        popd

    ;;

    # frog build
    # frog build -r path/to/repo
    # frog build -r path/to/repo -t false
    build)

        # set options index
        OPTIND=2

        # parse options
        while getopts ":r:t:" o; do

            case $o in

                # -r [str] path to frog repository
                r)
                    FROG_REPO=$OPTARG
                ;;

                # -t [str] run tests
                t)
                    FROG_TESTS=$OPTARG
                    echo ""
                ;;

                :)
                    echo "[o_O] option -$OPTARG requires argument"
                    exit 1
                ;;

                ?)
                    echo "[o_O] unknown option -$OPTARG"
                    exit 1
                ;;

            esac

        done

        # reset options index
        OPTIND=1

        # run tests, if not turned off
        if [ "$FROG_TESTS" == "true" ] ; then
            $0 test -r ${FROG_REPO}
        fi

        # build
        grunt

    ;;

    # frog create path/to/app
    # frog create path/to/app -r path/to/repo
    create)

        # required: path
        if [ ! "$2" ] ; then
            echo "[o_O] missing path to application"
            exit 1
        fi

        # set options index
        OPTIND=3

        # parse options
        while getopts ":r:" o; do

            case $o in

                # -r [str] path to frog repository
                r)
                    FROG_REPO=$OPTARG
                ;;

                :)
                    echo "[o_O] option -$OPTARG requires argument"
                    exit 1
                ;;

                ?)
                    echo "[o_O] unknown option -$OPTARG"
                    exit 1
                ;;

            esac

        done

        # reset options index
        OPTIND=1

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

    # frog test
    # frog test -r path/to/repo
    test)

        # set options index
        OPTIND=2

        # parse options
        while getopts ":r:" o; do

            case $o in

                # -r [str] path to frog repository
                r)
                    FROG_REPO=$OPTARG
                ;;

                :)
                    echo "[o_O] option -$OPTARG requires argument"
                    exit 1
                ;;

                ?)
                    echo "[o_O] unknown option -$OPTARG"
                    exit 1
                ;;

            esac

        done

        # reset options index
        OPTIND=1

        # run tests
        mocha -u tdd -R spec ${FROG_REPO}/tests

    ;;

    # frog .
    # frog path/to/app
    # frog path/to/app -e production
    # frog path/to/app -e production -l true
    # frog path/to/app -e production -l true -p 2000
    # frog path/to/app -e production -l true -p 2000 -u true
    *)

        # required: path
        if [ ! "$1" ] ; then
            echo "[o_O] missing path to application"
            exit 1
        fi

        # set index to
        OPTIND=2

        # parse options
        while getopts ":e:l:p:u:" o; do

            case $o in

                # -e [str] set environment (development, production)
                e)
                    FROG_ENV=$OPTARG
                ;;

                # -l [bol] load config.local
                l)
                    FROG_LOCAL=$OPTARG
                ;;

                # -p [int] specify port to run on
                p)
                    FROG_PORT=$OPTARG
                ;;

                # -u [bol] run in cluster mode
                u)
                    FROG_CLUSTER=$OPTARG
                ;;

                :)
                    echo "[o_O] option -$OPTARG requires argument"
                    exit 1
                ;;

                ?)
                    echo "[o_O] unknown option -$OPTARG"
                    exit 1
                ;;

            esac

        done

        # overwrite FROG_DIR, if incoming
        FROG_DIR="$1"

        # check for directory, should exist in path FROG_DIR
        if [ ! -d "${FROG_DIR}" ]; then
            echo "[o_O] application at ${FROG_DIR} not found"
            exit 1
        fi

        # change working directory
        pushd ${FROG_DIR}

        # start frog application
        nodemon frog.js -e=${FROG_ENV} -l=${FROG_LOCAL} -p=${FROG_PORT} -u=${FROG_CLUSTER}

        # change working directory (back to script context)
        popd

    ;;

esac