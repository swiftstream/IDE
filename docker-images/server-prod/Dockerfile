FROM swiftstream/base:noble

# Install Nginx, Brotli, and Noble distro-matched Brotli modules
RUN apt update && apt install -y \
    nginx \
    brotli \
    libbrotli1 \
    libnginx-mod-http-brotli-filter \
    libnginx-mod-http-brotli-static \
    gettext-base

ENV NGINX_CONFIG="/etc/nginx/nginx.conf"

# Copy required files
COPY cmd.sh /usr/local/bin/
COPY nginx.conf /etc/nginx/

# Image version, should be increased with any major change
ENV S_IMAGE_VERSION=101

# Server port
ENV SERVER_PORT=8080

RUN ["chmod", "+x", "/usr/local/bin/cmd.sh"]
CMD ["cmd.sh"]
