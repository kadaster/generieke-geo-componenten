ARG REGISTRY

FROM ${REGISTRY}nginx/nginx-unprivileged:1.30-alpine

WORKDIR /etc/nginx/html

USER root
RUN rm /etc/nginx/conf.d/default.conf && \
    chown root:root /etc/nginx

# Copy compiled Application sources
COPY dist/ggc-home/browser/ /etc/nginx/html/
COPY --chmod=444 nginx.conf /etc/nginx/nginx.conf
COPY --chmod=555 startup/start-application.sh /var/appdata/run/start-application.sh

RUN chmod -R a=rX /etc/nginx/html/

EXPOSE 8080

USER nginx

ENTRYPOINT ["/var/appdata/run/start-application.sh"]
