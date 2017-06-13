#!/usr/bin/env bash

apt-get update && apt-get install -y libpq-dev && docker-php-ext-install pgsql

# first arg is `-f` or `--some-option`
if [ "${1#-}" != "$1" ]; then
	set -- php "$@"
fi

echo "$@"

exec "$@"
