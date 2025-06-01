#!/bin/sh

sed -i "s|__BACKEND_URL__|$BACKEND_URL|g" /usr/share/nginx/html/js/env.js

nginx -g "daemon off;"
