#!/usr/bin/env bash

docker-php-ext-install pdo pdo_mysql

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- php "$@"
fi

exec "$@"
