FROM swiftstream/web-prod:focal

# Target architecture provided automatically with the --platform flag
ARG TARGETARCH

COPY web-dev/cmd.sh /usr/local/bin/
COPY dev-base.sh /usr/local/bin/
COPY web-dev/selfsigned.crt /etc/nginx/dev-certs/
COPY web-dev/selfsigned.key /etc/nginx/dev-certs/
COPY web-dev/nginx.conf /etc/nginx/

# Conditional copy based on architecture
COPY web-dev/wasm-strip-${TARGETARCH} /usr/local/bin/wasm-strip
COPY web-dev/wasm-opt-${TARGETARCH} /usr/local/bin/wasm-opt

RUN ["chmod", "+x", "/usr/local/bin/cmd.sh"]
CMD ["cmd.sh"]