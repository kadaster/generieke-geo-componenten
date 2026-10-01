#!/bin/sh

# We place all our application file in one directory.
# By starting the JVM from that directory, it is added to the classpath by default.
# This way,the application has access to secrets.properties without any additional configuration.

# Set logging to verbose, to show everything in console
set -x
# end script if any command fails or if any variable is unset
set -eu

env

# Startup script based on the ENV variable STARTAPP. This is set via the deploy-cloud-<env>.yml config file

echo "Get file location"
set -- /etc/nginx/html/main*.js

# check if exactly one Angular main bundle is found, if not exit with error
if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
  echo "ERROR: Expected exactly one Angular main bundle, found: $*" >&2
  exit 1
fi

mainFilePath="$1"
mainFileName="${1##*/}"

# check if the ENV_PIWIK_SCRIPT environment variable is set, if not set or empty string exit with error
if [ -z "${ENV_PIWIK_SCRIPT:-}" ]; then
  echo "ERROR: ENV_PIWIK_SCRIPT is not configured" >&2
  exit 1
fi

# substitute environment variable
echo "Substitute this key for:$ENV_PIWIK_SCRIPT"
tmpFile="$(mktemp "/tmp/${mainFileName}.tmp.XXXXXX")"


envsubst '$ENV_PIWIK_SCRIPT' < "$mainFilePath" > "$tmpFile"

chmod 644 "$tmpFile"
# move modified files to original location
mv "$tmpFile" "${mainFilePath}"

# static content read-only maken
chmod -R a=rX /etc/nginx/html/

# run nginx
nginx -g 'daemon off;'
