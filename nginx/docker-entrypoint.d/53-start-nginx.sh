# docker-entrypoint.d/53-start-nginx.sh
#!/bin/sh
# After dummy-cert and fix-perms, hand off to the official entrypoint
CERT=/etc/letsencrypt/live/brewly.ru/fullchain.pem

if [ -f "$CERT" ]; then
  echo "[entrypoint] real cert present — starting nginx"
else
  echo "[entrypoint] no real cert — starting nginx with dummy cert"
fi

exec /docker-entrypoint.sh "$@"