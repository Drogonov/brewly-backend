#!/bin/sh
# renew-certbot.sh — fetch/force-renew Let’s Encrypt certs via Docker + reload nginx

# Ensure current working directory is project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Paths to certbot volumes
WEBROOT="$PROJECT_ROOT/certbot/www"
CONF_DIR="$PROJECT_ROOT/certbot/conf"

# Determine Docker network ID for nginx/app
NETWORK_ID=$(docker network ls --filter name=brewly-backend_default -q)

# Run Certbot to force-renew certificates
docker run --rm \
  -v "$WEBROOT:/var/www/certbot" \
  -v "$CONF_DIR:/etc/letsencrypt" \
  --network "$NETWORK_ID" \
  certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email tech@brewly.ru \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d brewly.ru

# Reload nginx to pick up new certificates
docker exec nginx nginx -s reload
