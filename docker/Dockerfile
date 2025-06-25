# Imagem base
FROM php:8.2-fpm

# Diretório da aplicação
ARG APP_DIR=/var/www

# Versão da Lib do Redis para PHP
ARG REDIS_LIB_VERSION=6.0.2

# Instala dependências essenciais e extensões PHP
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    apt-utils \
    supervisor \
    curl \
    nano \
    libzip-dev \
    zlib1g-dev \
    libpq-dev \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    net-tools \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_pgsql zip iconv mbstring simplexml exif pcntl bcmath gd sockets fileinfo \
    && pecl install redis-${REDIS_LIB_VERSION} \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Define usuário e permissão
RUN usermod -u 1000 www-data && groupmod -g 1000 www-data
RUN mkdir -p /var/www/storage/logs && chown -R www-data:www-data /var/www

# Copia configurações personalizadas
COPY ./docker/supervisord/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Define diretório de trabalho
WORKDIR $APP_DIR

# Copia os arquivos da aplicação com permissões adequadas
COPY --chown=www-data:www-data . .

# Comando padrão para iniciar o Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
