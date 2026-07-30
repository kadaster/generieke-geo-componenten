
ARG REGISTRY

FROM ${REGISTRY}nginxinc/nginx-unprivileged:1.29-alpine

WORKDIR /etc/nginx/html

USER root
RUN adduser --home /etc/ggc-home --disabled-password --gecos "" ggc-home

# Copy compiled Application sources
COPY --chown=ggc-home:ggc-home dist/ggc-home/browser/ /etc/nginx/html/
COPY --chown=ggc-home:ggc-home dist/ggc-home/public/assets/toegankelijkheid.html /etc/nginx/html/


COPY nginx.conf /etc/nginx/nginx.conf
COPY startup/start-application.sh /var/appdata/run/start-application.sh

# Create cache directories
RUN mkdir -p /var/cache/nginx/client_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp && \
    mkdir -p /var/cache/nginx/proxy_temp && \
    mkdir -p /var/cache/nginx/fastcgi_temp && \
    mkdir -p /var/cache/nginx/scgi_temp && \
    mkdir -p /var/cache/nginx/uwsgi_temp

# Create log directory and file, set permissions
RUN mkdir -p /var/log/nginx && \
    touch /var/log/nginx/error.log && \
    chown -R ggc-home:ggc-home /var/log/nginx && \
    chown -R ggc-home:ggc-home /etc/nginx/html/

# Permissions adjustments
RUN chown -R ggc-home:ggc-home /var/cache/nginx/ /var/appdata/run /etc/nginx/html/ /tmp && \
    chmod -R a+rwX,g+rX /etc/nginx/html/ && \
    chmod +x /var/appdata/run/start-application.sh && \
    chmod -R u+rwX,g+rX /tmp && \
    chmod -R u+rwX,g+rX /var/cache/nginx

USER ggc-home

EXPOSE 8080

ENTRYPOINT ["/var/appdata/run/start-application.sh"]
