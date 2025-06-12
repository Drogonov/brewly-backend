FROM nginx:latest

# ensure nginx user can read real certs
COPY docker-entrypoint.d/52-fix-perms.sh /docker-entrypoint.d/52-fix-perms.sh
RUN chmod +x /docker-entrypoint.d/52-fix-perms.sh

COPY nginx.conf      /etc/nginx/nginx.conf
COPY conf.d/         /etc/nginx/conf.d/