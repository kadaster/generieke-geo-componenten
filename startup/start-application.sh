#!/bin/sh

set -eu

set -- /etc/nginx/html/main*.js
if [ "$#" -ne 1 ] || [ ! -f "$1" ]; then
    echo "Expected exactly one main*.js file in /etc/nginx/html." >&2
    exit 1
fi
mainFileName="$1"

# Only the generated bundle is writable; copied application files stay unchanged.
mkdir -p /var/cache/nginx/app
mainTemporaryFile="$(mktemp /var/cache/nginx/app/.main.XXXXXX)"
trap 'rm -f "$mainTemporaryFile"' EXIT

envsubst '$ENV_PIWIK_SCRIPT' < "$mainFileName" > "$mainTemporaryFile"
chmod 444 "$mainTemporaryFile"
mv -f "$mainTemporaryFile" "/var/cache/nginx/app/${mainFileName##*/}"

exec nginx -g 'daemon off;'
