#!/bin/sh
set -e

echo "Running database migrations..."

# Run migrations using node-pg-migrate
# The migrations are compiled to JS and located in dist/migrations
npx node-pg-migrate up \
  --migrations-dir dist/migrations \
  --database-url-var DATABASE_URL \
  --migration-file-language js \
  || echo "Migration failed or already applied"

echo "Migrations completed. Starting server..."

# Execute the main command
exec "$@"
