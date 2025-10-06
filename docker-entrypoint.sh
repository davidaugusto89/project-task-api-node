#!/bin/sh
set -e

if [ ! -f /app/.env ]; then
  echo "📝 .env não encontrado; copiando .env.example"
cp /app/.env.example /app/.env
echo "✅ .env foi copiado"
else
  echo "ℹ️ .env existente detectado; mantendo configurações fornecidas"
fi

echo "⏳ Aguardando MySQL em $DB_HOST:$DB_PORT..."
i=0
while ! mariadb-admin ping -h"$DB_HOST" -P"$DB_PORT" --silent >/dev/null 2>&1; do
  i=$((i+1))
  [ $i -gt 120 ] && echo "❌ Timeout aguardando MySQL" && exit 1
  sleep 2
done
echo "✅ MySQL está respondendo"

echo "💻 Criando banco de dados..."

mariadb -h"${DB_HOST_TEST:-$DB_HOST}" -P"${DB_PORT_TEST:-$DB_PORT}" -u"$DB_USER" -p"$DB_PASSWORD" -N -e \
  "CREATE DATABASE IF NOT EXISTS \`${DB_NAME_TEST:-projects_db_test}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "📦 Executando migrations..."
npx sequelize-cli db:migrate --config src/database/config.js

echo "🌱 Executando seeders..."
ROWCOUNT=$(mariadb -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" -N -e "SELECT COUNT(*) FROM \`$DB_NAME\`.\`projects\`;" 2>/dev/null || echo "")
if [ -z "$ROWCOUNT" ] || [ "$ROWCOUNT" = "0" ]; then
  npx sequelize-cli db:seed:all --config src/database/config.js || true
fi

echo "🚀 Iniciando aplicação..."
exec "$@"
