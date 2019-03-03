#!/usr/bin/env bash
docker build -t cshub-shared -t cshubnl/shared:dev ../cshub-shared
docker build -t cshubnl/client:dev ../cshub-client
docker build -t cshubnl/server:dev ../cshub-server

docker push cshubnl/shared:dev
docker push cshubnl/client:dev
docker push cshubnl/server:dev
