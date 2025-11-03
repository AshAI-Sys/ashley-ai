#!/bin/bash
# Database Backup Script
# Usage: ./scripts/backup-database.sh

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_FILE="$BACKUP_DIR/ashley-ai-backup-$TIMESTAMP.sql"

mkdir -p "$BACKUP_DIR"

echo "🔄 Starting database backup..."

# For PostgreSQL (Neon/Supabase/Railway)
pg_dump $DATABASE_URL > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup completed: $BACKUP_FILE"
  
  # Compress backup
  gzip "$BACKUP_FILE"
  echo "✅ Compressed: $BACKUP_FILE.gz"
  
  # Delete backups older than 30 days
  find "$BACKUP_DIR" -name "*.sql.gz" -mtime +30 -delete
  echo "✅ Old backups cleaned up"
else
  echo "❌ Backup failed!"
  exit 1
fi
