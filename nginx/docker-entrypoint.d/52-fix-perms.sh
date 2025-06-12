# docker-entrypoint.d/52-fix-perms.sh
#!/bin/sh
# Ensure nginx (user “nginx”) can read all files under /etc/letsencrypt
if [ -d /etc/letsencrypt ]; then
  chmod -R a+rX /etc/letsencrypt
fi