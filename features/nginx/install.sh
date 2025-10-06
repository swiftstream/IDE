#!/usr/bin/bash

set -e

# Read version from the environment variable
NGINX_VERSION="${VERSION:-latest}"

# Update package list
apt-get update

# Install Nginx
if [ "$NGINX_VERSION" = "latest" ]; then
    echo "Installing Nginx..."
    apt-get install -y nginx
else
    echo "Installing Nginx version $NGINX_VERSION..."
    if apt-cache show "nginx=$NGINX_VERSION" >/dev/null 2>&1; then
        apt-get install -y "nginx=$NGINX_VERSION"
    else
        echo "Requested version $NGINX_VERSION not available. Installing latest version."
        apt-get install -y nginx
    fi
fi

# Start Nginx
service nginx start || nginx

# Verify installation
nginx -v

echo "Nginx installation completed."