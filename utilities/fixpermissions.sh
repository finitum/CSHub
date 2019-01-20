#!/bin/bash
chown pm2 ./cshub-server -R
chown pm2 ./cshub-shared -R
chown root:root ./cshub-client -R

chmod 770 ./cshub-server -R
chmod 770 ./cshub-shared -R
chmod 771 ./cshub-client -R

chmod 700 ./cshub-server/src/settings.*
