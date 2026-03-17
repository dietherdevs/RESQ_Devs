FROM richarvey/nginx-php-fpm:latest

# 1. Set the exact folder we are working in
WORKDIR /var/www/html

# 2. Copy all your Laravel files into that folder
COPY . .

# 3. Server Configuration
ENV SKIP_COMPOSER 1
ENV WEBROOT /var/www/html/public
ENV PHP_ERRORS_STDERR 1
ENV RUN_SCRIPTS 1
ENV REAL_IP_HEADER 1

# 4. Laravel Configuration
ENV APP_ENV production
ENV APP_DEBUG true
ENV LOG_CHANNEL stderr
ENV COMPOSER_ALLOW_SUPERUSER 1

# 5. Force Composer to install dependencies RIGHT NOW during the build
RUN composer install --ignore-platform-reqs --no-dev --optimize-autoloader

# 6. Run our startup script
CMD ["sh", "./start.sh"]