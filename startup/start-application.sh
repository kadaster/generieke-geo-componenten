#!/bin/sh

# We place all our application file in one directory.
# By starting the JVM from that directory, it is added to the classpath by default.
# This way,the application has access to secrets.properties without any additional configuration.

# Set logging to verbose, to show everything in console
set -x

env

# run nginx
nginx -g 'daemon off;'
