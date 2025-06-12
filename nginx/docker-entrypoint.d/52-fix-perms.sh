#!/bin/sh
# Ensure nginx (user “nginx”) can read /etc/letsencrypt
if [ -d /etc/letsencrypt ]; then
  chmod -R a+rX /etc/letsencrypt
fi
exec /docker-entrypoint.sh "$@"