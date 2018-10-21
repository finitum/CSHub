chown pm2:faqsite ./faq-site-server -R
chown pm2:faqsite ./faq-site-shared -R
chown victor:faqsite ./faq-site-client -R

chmod 770 ./faq-site-server -R
chmod 770 ./faq-site-shared -R
chmod 771 ./faq-site-client -R

chmod 700 ./faq-site-server/src/settings.*
