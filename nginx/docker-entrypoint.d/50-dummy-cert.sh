#!/bin/sh
CERT_DIR=/etc/letsencrypt/live/brewly.ru

if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "[entrypoint] Generating dummy SSL certificate for brewly.ru …"
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days 365 \
    -subj "/CN=brewly.ru" \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/privkey.pem" \
    -out    "$CERT_DIR/fullchain.pem"
fi