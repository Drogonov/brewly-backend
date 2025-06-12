#!/bin/sh
# renew-certbot.sh

# 1) Obtain or renew any certificates
docker compose run --rm certbot certonly \
  --noninteractive \
  --agree-tos \
  --email tech@brewly.ru \
  --webroot -w ./certbot/www \
  --force-renewal \
  -d brewly.ru

# 2) Reload nginx so it picks up any new cert
docker compose exec nginx nginx -s reload