#!/bin/sh

# We place all our application file in one directory.
# By starting the JVM from that directory, it is added to the classpath by default.
# This way,the application has access to secrets.properties without any additional configuration.

# Set logging to verbose, to show everything in console
set -x

env

# Startup script based on the ENV variable STARTAPP. This is set via the deploy-cloud-<env>.yml config file

echo "Get file location"
# If KEYs necessary then replace.
export mainFileName="$(ls /etc/nginx/html/main*.js)"
# substitute environment variable
echo "Substitute this key for:$ENV_PIWIK_SCRIPT"
tmpFile="$(mktemp /var/appdata/run/main.tmp.XXXXXX)"
envsubst '\$ENV_PIWIK_SCRIPT' < "$mainFileName" > "$tmpFile"
# move modified files to original location
mv "$tmpFile" "${mainFileName}"

# static content read-only maken
chmod -R a=rX /etc/nginx/html/

# run nginx
nginx -g 'daemon off;'
