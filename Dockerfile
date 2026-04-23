FROM ${REGISTRY}nginxinc/nginx-unprivileged:1.29-alpine

WORKDIR /etc/nginx/html

USER root
RUN adduser \
    --home /etc/ggc-home \
    --disabled-password \
    --gecos "" \
    ggc-home

COPY --chown=ggc-home:ggc-home \
    dist/ggc-home/browser/ \
    /etc/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf
COPY startup/start-application.sh /var/appdata/run/start-application.sh

RUN mkdir -p \
      /var/cache/nginx/client_temp \
      /var/cache/nginx/proxy_temp \
      /var/cache/nginx/fastcgi_temp \
      /var/cache/nginx/uwsgi_temp \
      /var/cache/nginx/scgi_temp \
      /var/log/nginx \
      /var/appdata/run \
 && touch /var/log/nginx/error.log

RUN chown -R ggc-home:ggc-home \
      /etc/nginx \
      /etc/nginx/html \
      /var/cache/nginx \
      /var/log/nginx \
      /var/appdata \
      /tmp \
 && chmod +x /var/appdata/run/start-application.sh \
 && chmod -R a+rX /etc/nginx/html /tmp

USER ggc-home

EXPOSE 8080
ENTRYPOINT ["/var/appdata/run/start-application.sh"]
