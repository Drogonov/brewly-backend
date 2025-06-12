FROM nginx:latest

COPY docker-entrypoint.d/50-dummy-cert.sh /docker-entrypoint.d/50-dummy-cert.sh
RUN chmod +x /docker-entrypoint.d/50-dummy-cert.sh

COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/