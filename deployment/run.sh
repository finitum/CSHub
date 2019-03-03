#!/bin/bash

run() {
    echo "Starting $1"
    cd ./$1
    docker-compose pull
    docker-compose down
    docker-compose up -d
    cd ../
}


if [[ $1 ]]; then
    run $1
else
    run "logging"
    run "traefik"
    run "portainer"
    run "prerender"
    run "prod"
    run "dev"
    run "watchtower"
fi
