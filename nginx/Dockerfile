FROM nginx:latest

# Скопировать наш скрипт в /docker-entrypoint.d и сделать его исполняемым
COPY docker-entrypoint.d/50-dummy-cert.sh /docker-entrypoint.d/50-dummy-cert.sh
RUN chmod +x /docker-entrypoint.d/50-dummy-cert.sh

# Сохраняем стандартный entrypoint/cmd