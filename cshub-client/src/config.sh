#!/bin/sh
# With help of https://www.brandonbarnett.io/blog/2018/05/accessing-environment-variables-from-a-webpack-bundle-in-a-docker-container/
echo "window.appConfig = { VUE_APP_API_URL: '${VUE_APP_API_URL}'} " >> config.js
cat config.js
exec nginx -g 'daemon off;'
