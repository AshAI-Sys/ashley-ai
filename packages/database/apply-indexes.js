#!/usr/bin/env node
/**
 * Apply database indexes for performance optimization
 * Run: node apply-indexes.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function applyIndexes() {
  try {
    console.log('🚀 Starting database index optimization...')
    console.log('📄 Reading SQL file...')

    const sqlPath = path.join(__dirname, '../../services/ash-admin/database-optimization.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf-8')

    // Split by statements (simple splitting by semicolon)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

    console.log(`📊 Found ${statements.length} SQL statements to execute\n`)

    let successCount = 0
    let skipCount = 0

    for (const statement of statements) {
      // Skip comments and SELECT statements
      if (statement.startsWith('--') || statement.startsWith('/*') || statement.startsWith('SELECT')) {
        skipCount++
        continue
      }

      try {
        // Extract index name for logging
        const indexMatch = statement.match(/CREATE INDEX.*?idx_(\w+)/)
        const indexName = indexMatch ? `idx_${indexMatch[1]}` : 'unknown'

        await prisma.$executeRawUnsafe(statement)
        console.log(`✅ Created: ${indexName}`)
        successCount++
      } catch (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists')) {
          skipCount++
        } else {
          console.error(`❌ Error:`, error.message)
        }
      }
    }

    // Get final index count
    const result = await prisma.$queryRawUnsafe(`
      SELECT COUNT(*) as count
      FROM sqlite_master
      WHERE type = 'index'
        AND name LIKE 'idx_%'
    `)

    console.log(`\n✨ Index optimization complete!`)
    console.log(`📈 Statistics:`)
    console.log(`   - Indexes created: ${successCount}`)
    console.log(`   - Statements skipped: ${skipCount}`)
    console.log(`   - Total indexes in database: ${result[0].count}`)
    console.log(`\n🎯 Database performance improved!`)

  } catch (error) {
    console.error('❌ Failed to apply indexes:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

applyIndexes()
