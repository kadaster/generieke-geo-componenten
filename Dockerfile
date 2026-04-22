FROM ${REGISTRY}nginxinc/nginx-unprivileged:1.29-alpine

WORKDIR /etc/nginx/html

# Runtime user
USER root
RUN adduser --home /etc/ggc-home --disabled-password --gecos "" ggc-home

# Copy PREBUILT Angular output
COPY --chown=ggc-home:ggc-home dist/ggc-home/browser/ /etc/nginx/html/

# Nginx + startup
COPY nginx/nginx.conf /etc/nginx/nginx.conf
COPY startup/start-application.sh /var/appdata/run/start-application.sh

RUN chmod +x /var/appdata/run/start-application.sh \
 && chown -R ggc-home:ggc-home /etc/nginx /var/appdata /tmp

USER ggc-home
EXPOSE 8080

ENTRYPOINT ["/var/appdata/run/start-application.sh"]
