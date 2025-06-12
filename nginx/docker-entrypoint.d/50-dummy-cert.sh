#!/bin/sh
CERT_DIR=/etc/letsencrypt/live/brewly.ru

if [ ! -f "$CERT_DIR/fullchain.pem" ] || [ ! -f "$CERT_DIR/privkey.pem" ]; then
  echo "[entrypoint] Generating dummy SSL certificate for brewly.ru …"
  mkdir -p "$CERT_DIR"
  openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -subj "/CN=brewly.ru" \
    -addext "subjectAltName=DNS:brewly.ru" \
    -keyout "$CERT_DIR/privkey.pem" \
    -out    "$CERT_DIR/fullchain.pem"
fi