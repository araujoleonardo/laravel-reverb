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
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo_mysql pdo_pgsql zip iconv mbstring simplexml exif pcntl bcmath gd sockets fileinfo \
    && pecl install redis-${REDIS_LIB_VERSION} \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia configurações personalizadas
COPY ./docker/supervisord/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Define diretório de trabalho
WORKDIR $APP_DIR

# Copia os arquivos da aplicação com permissões adequadas
COPY --chown=www-data:www-data . .

# Define o proprietário do diretório de trabalho
RUN chown -R www-data:www-data $APP_DIR

# Instala e configura o nginx
RUN apt-get update && apt-get install nginx -y
RUN rm -rf /etc/nginx/sites-enabled/* && rm -rf /etc/nginx/sites-available/*
COPY ./docker/nginx/default.conf /etc/nginx/sites-enabled/default.conf

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Comando padrão para iniciar o Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
