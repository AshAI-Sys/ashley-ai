#!/bin/bash
# Ashley AI - Database Backup Script

set -e

BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ashley_ai_backup_${DATE}.sql"

echo "🗄️ Starting database backup..."
echo "📅 Backup timestamp: ${DATE}"

# Create backup directory if it doesn't exist
mkdir -p ${BACKUP_DIR}

# Perform database backup
pg_dump -h postgres -U ashley_admin -d ashley_ai_prod > ${BACKUP_DIR}/${BACKUP_FILE}

# Compress the backup
gzip ${BACKUP_DIR}/${BACKUP_FILE}

echo "✅ Backup completed: ${BACKUP_FILE}.gz"

# Clean up old backups (keep last 30 days)
find ${BACKUP_DIR} -name "ashley_ai_backup_*.sql.gz" -mtime +30 -delete

echo "🧹 Old backups cleaned up"
echo "📁 Backup saved to: ${BACKUP_DIR}/${BACKUP_FILE}.gz"