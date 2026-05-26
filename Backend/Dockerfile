# 1. Use the official PHP image
FROM php:8.2-cli

# 2. Install system dependencies and PostgreSQL drivers
RUN apt-get update -y && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql

# 3. Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Set the working directory inside the container
WORKDIR /app

# 5. Copy your Laravel files into the container
COPY . .

# 6. Install Laravel dependencies safely
RUN composer install --no-dev --optimize-autoloader

# 7. Expose the port Render uses
EXPOSE $PORT

# 8. Start the Laravel server and run migrations automatically
CMD php artisan config:clear && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT