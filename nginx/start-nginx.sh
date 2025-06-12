#!/bin/sh
CERT=/etc/letsencrypt/live/brewly.ru/fullchain.pem

if [ ! -f "$CERT" ]; then
  echo "[start-nginx] waiting for real cert to appear…"
  while [ ! -f "$CERT" ]; do
    sleep 1
  done
fi

exec nginx -g 'daemon off;'