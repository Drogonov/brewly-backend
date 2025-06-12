#!/bin/sh
# renew-certbot.sh — fetch/force-renew Let’s Encrypt certs via Docker + reload nginx

# Ensure current working directory is project root
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

# Paths to certbot volumes
WEBROOT="$PROJECT_ROOT/certbot/www"
CONF_DIR="$PROJECT_ROOT/certbot/conf"

# Use your Compose-created network name. By default it will be:
#   <project>_brewly_net
# If your project folder is named "brewly-backend", that's:
NETWORK_NAME="brewly-backend_brewly_net"

# Run Certbot to force-renew certificates
docker run --rm \
  -v "$WEBROOT:/var/www/certbot" \
  -v "$CONF_DIR:/etc/letsencrypt" \
  --network "$NETWORK_NAME" \
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