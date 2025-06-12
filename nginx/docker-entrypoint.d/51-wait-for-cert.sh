#!/bin/sh
CERT=/etc/letsencrypt/live/brewly.ru/fullchain.pem

if [ ! -f "$CERT" ]; then
  echo "[entrypoint] waiting for real cert to appear…"
  while [ ! -f "$CERT" ]; do
    sleep 1
  done
fi