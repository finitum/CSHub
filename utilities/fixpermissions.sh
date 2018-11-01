chown pm2:faqsite ./cshub-server -R
chown pm2:faqsite ./cshub-shared -R
chown victor:faqsite ./cshub-client -R

chmod 770 ./cshub-server -R
chmod 770 ./cshub-shared -R
chmod 771 ./cshub-client -R

chmod 700 ./cshub-server/src/settings.*
