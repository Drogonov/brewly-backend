# brewly-backend/nginx/Dockerfile
FROM nginx:latest

# 1) Dummy-cert generator (with SAN)
COPY docker-entrypoint.d/50-dummy-cert.sh /docker-entrypoint.d/50-dummy-cert.sh

# 2) Wait-for-real-cert helper
COPY docker-entrypoint.d/51-wait-for-cert.sh /docker-entrypoint.d/51-wait-for-cert.sh

# 3) start-nginx wrapper (optional, if using start-nginx.sh)
COPY start-nginx.sh /docker-entrypoint.d/52-start-nginx.sh

# Make all entrypoint scripts executable
RUN chmod +x \
    /docker-entrypoint.d/50-dummy-cert.sh \
    /docker-entrypoint.d/51-wait-for-cert.sh \
    /docker-entrypoint.d/52-start-nginx.sh

# 4) Nginx configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/    /etc/nginx/conf.d/

# No ENTRYPOINT or CMD override: rely on the official Nginx image's entrypoint
