# renew-certbot.sh
#!/bin/sh
set -e

# 1) Obtain or renew any certificates
docker compose run --rm certbot certonly \
  --noninteractive \
  --agree-tos \
  --email tech@brewly.ru \
  --webroot \
    --webroot-path=/var/www/certbot \
  --force-renewal \
  --deploy-hook "nginx -s reload" \
  -d brewly.ru

# (no separate reload needed; deploy-hook covers it)