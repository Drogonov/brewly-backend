# brewly-backend/nginx/Dockerfile
FROM nginx:latest

# 1) Dummy-cert generator (with SAN)
COPY docker-entrypoint.d/50-dummy-cert.sh /docker-entrypoint.d/50-dummy-cert.sh

# 2) Wait-for-real-cert helper
COPY docker-entrypoint.d/51-wait-for-cert.sh /docker-entrypoint.d/51-wait-for-cert.sh

# 3) Fix permissions on cert directories so nginx (user 'nginx') can read them
COPY docker-entrypoint.d/52-fix-perms.sh /docker-entrypoint.d/52-fix-perms.sh

# 4) Optional: start-nginx wrapper to block until real cert appears
COPY start-nginx.sh /docker-entrypoint.d/53-start-nginx.sh

# Make all entrypoint scripts executable
RUN chmod +x \
    /docker-entrypoint.d/50-dummy-cert.sh \
    /docker-entrypoint.d/51-wait-for-cert.sh \
    /docker-entrypoint.d/52-fix-perms.sh \
    /docker-entrypoint.d/53-start-nginx.sh

# 5) Nginx configuration files
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/    /etc/nginx/conf.d/

# Use the official entrypoint + default CMD
# ENTRYPOINT and CMD are inherited from nginx:latest
