# Usa uma imagem base CLI
FROM php:8.2-cli

# Diretório da aplicação
ARG APP_DIR=/var/www

# Versão da Lib do Redis para PHP
ARG REDIS_LIB_VERSION=6.0.2

# Instala dependências do sistema e extensões PHP
RUN apt-get update -y && apt-get install -y --no-install-recommends \
    supervisor \
    curl \
    unzip \
    libpq-dev \
    git \
    && docker-php-ext-install pdo_pgsql bcmath pcntl sockets \
    && pecl install redis-${REDIS_LIB_VERSION} \
    && docker-php-ext-enable redis \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Instala Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copia configurações personalizadas
COPY ./docker/reverb/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY ./docker/php/custom.ini /usr/local/etc/php/conf.d/custom.ini

# Define diretório de trabalho
WORKDIR $APP_DIR

# Copia apenas arquivos necessários para o Horizon funcionar
COPY --chown=www-data:www-data composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-scripts --no-progress --ignore-platform-reqs

COPY --chown=www-data:www-data . .

# Ajusta permissões
RUN chown -R www-data:www-data $APP_DIR

# Expõe a porta padrão do Reverb
EXPOSE 8080

# Comando para iniciar o Supervisor (que por sua vez inicia o Reverb)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
