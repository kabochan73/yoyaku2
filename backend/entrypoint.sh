#!/bin/sh
set -e

# composerパッケージがない場合はインストール
if [ ! -f /var/www/html/vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist
fi

# .envがない場合はコピー
if [ ! -f /var/www/html/.env ]; then
    cp /var/www/html/.env.example /var/www/html/.env
    php artisan key:generate
fi

# ストレージのパーミッション
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

exec "$@"
