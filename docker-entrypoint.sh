#!/bin/sh
set -e

echo "🔧 Copiando .env.example para .env"
cp /app/.env.example /app/.env

echo "🔧 Configurando variáveis de ambiente... OK"

echo "🚀 Iniciando aplicação..."
exec "$@"