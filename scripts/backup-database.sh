#!/bin/bash

# Database Backup Script for Kadan
# This script creates a backup of your Neon PostgreSQL database

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="$BACKUP_DIR/kadan-backup-$DATE.sql"
RETENTION_DAYS=30

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Kadan Database Backup Script ===${NC}"
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}Error: DATABASE_URL environment variable is not set${NC}"
    echo "Please set it in your .env.local file or export it:"
    echo "  export DATABASE_URL='your-connection-string'"
    exit 1
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}Creating backup directory: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
fi

# Check if pg_dump is available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}Error: pg_dump is not installed${NC}"
    echo "Please install PostgreSQL client tools:"
    echo "  macOS: brew install postgresql"
    echo "  Ubuntu/Debian: sudo apt-get install postgresql-client"
    echo "  Windows: Download from https://www.postgresql.org/download/windows/"
    exit 1
fi

# Perform backup
echo -e "${YELLOW}Starting backup...${NC}"
echo "Backup file: $BACKUP_FILE"

if pg_dump "$DATABASE_URL" > "$BACKUP_FILE"; then
    BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo -e "${GREEN}✓ Backup completed successfully!${NC}"
    echo "  File: $BACKUP_FILE"
    echo "  Size: $BACKUP_SIZE"
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi

# Compress backup
echo -e "${YELLOW}Compressing backup...${NC}"
if gzip "$BACKUP_FILE"; then
    COMPRESSED_SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo -e "${GREEN}✓ Backup compressed${NC}"
    echo "  File: $BACKUP_FILE.gz"
    echo "  Size: $COMPRESSED_SIZE"
    BACKUP_FILE="$BACKUP_FILE.gz"
else
    echo -e "${YELLOW}Warning: Could not compress backup (gzip not available)${NC}"
fi

# Clean up old backups
echo ""
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "kadan-backup-*.sql*" -type f -mtime +$RETENTION_DAYS -delete
REMAINING_BACKUPS=$(find "$BACKUP_DIR" -name "kadan-backup-*.sql*" -type f | wc -l)
echo -e "${GREEN}✓ Cleanup complete${NC}"
echo "  Remaining backups: $REMAINING_BACKUPS"

# Summary
echo ""
echo -e "${GREEN}=== Backup Summary ===${NC}"
echo "  Latest backup: $BACKUP_FILE"
echo "  Total backups: $REMAINING_BACKUPS"
echo "  Retention: $RETENTION_DAYS days"
echo ""
echo -e "${YELLOW}To restore this backup:${NC}"
echo "  gunzip -c $BACKUP_FILE | psql \$DATABASE_URL"
echo ""
echo -e "${GREEN}Done!${NC}"
