#!/usr/bin/env bash

echo "Caching config..."
php artisan config:cache

echo "Caching routes..."
php artisan route:cache

echo "Running migrations..."
php artisan migrate --force

echo "Starting Nginx web server..."
# Boot up the server!
/start.sh