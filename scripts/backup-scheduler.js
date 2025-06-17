#!/usr/bin/env node

/**
 * StreamAX Backup Scheduler
 * 
 * This script handles automated database backups for the StreamAX platform.
 * It can be run as a cron job or standalone script.
 * 
 * Usage:
 *   node backup-scheduler.js [options]
 * 
 * Options:
 *   --force     Force backup even if one was recently created
 *   --cleanup   Only run cleanup of old backups
 *   --verify    Verify existing backups
 *   --restore   Restore from backup (requires --backup-id)
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs').promises
const path = require('path')
const { execSync } = require('child_process')

// Configuration
const config = {
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  backupDir: process.env.BACKUP_DIR || '/tmp/streamax-backups',
  retentionDays: parseInt(process.env.BACKUP_RETENTION_DAYS) || 30,
  maxBackupsPerDay: parseInt(process.env.MAX_BACKUPS_PER_DAY) || 3,
  compressionLevel: parseInt(process.env.BACKUP_COMPRESSION_LEVEL) || 6,
  encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  s3Bucket: process.env.BACKUP_S3_BUCKET,
  s3Region: process.env.BACKUP_S3_REGION || 'us-east-1',
  webhookUrl: process.env.BACKUP_WEBHOOK_URL,
  tables: [
    'users',
    'stream_sessions', 
    'stream_requests',
    'user_activities',
    'error_logs',
    'performance_metrics',
    'backup_metadata'
  ]
}

class BackupScheduler {
  constructor() {
    this.supabase = createClient(config.supabaseUrl, config.supabaseServiceKey)
    this.startTime = Date.now()
  }

  async run() {
    try {
      console.log('🚀 StreamAX Backup Scheduler started')
      console.log(`📅 ${new Date().toISOString()}`)
      
      const args = process.argv.slice(2)
      
      if (args.includes('--cleanup')) {
        await this.cleanupOldBackups()
        return
      }
      
      if (args.includes('--verify')) {
        await this.verifyBackups()
        return
      }
      
      if (args.includes('--restore')) {
        const backupId = this.getArgValue(args, '--backup-id')
        if (!backupId) {
          throw new Error('--backup-id is required for restore operation')
        }
        await this.restoreBackup(backupId)
        return
      }
      
      const force = args.includes('--force')
      await this.createBackup(force)
      
    } catch (error) {
      console.error('❌ Backup scheduler failed:', error)
      await this.notifyFailure(error)
      process.exit(1)
    }
  }

  async createBackup(force = false) {
    console.log('📦 Starting backup creation...')
    
    // Check if we should create a backup
    if (!force && !(await this.shouldCreateBackup())) {
      console.log('⏭️  Skipping backup - recent backup exists')
      return
    }

    const backupId = `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    try {
      // Create backup directory
      await this.ensureBackupDirectory()
      
      // Create backup metadata
      await this.createBackupMetadata(backupId)
      
      // Export data
      const backupData = await this.exportData()
      
      // Compress and encrypt
      const backupFile = await this.processBackupData(backupId, backupData)
      
      // Upload to cloud storage if configured
      if (config.s3Bucket) {
        await this.uploadToS3(backupFile, backupId)
      }
      
      // Update metadata
      await this.updateBackupMetadata(backupId, {
        status: 'completed',
        file_path: backupFile,
        size: (await fs.stat(backupFile)).size,
        checksum: await this.calculateChecksum(backupFile)
      })
      
      // Cleanup old backups
      await this.cleanupOldBackups()
      
      const duration = Date.now() - this.startTime
      console.log(`✅ Backup completed successfully in ${duration}ms`)
      console.log(`📁 Backup ID: ${backupId}`)
      
      await this.notifySuccess(backupId, duration)
      
    } catch (error) {
      await this.updateBackupMetadata(backupId, { status: 'failed' })
      throw error
    }
  }

  async shouldCreateBackup() {
    const today = new Date().toISOString().split('T')[0]
    
    const { data: recentBackups } = await this.supabase
      .from('backup_metadata')
      .select('created_at')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
    
    return !recentBackups || recentBackups.length < config.maxBackupsPerDay
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(config.backupDir)
    } catch {
      await fs.mkdir(config.backupDir, { recursive: true })
    }
  }

  async createBackupMetadata(backupId) {
    await this.supabase
      .from('backup_metadata')
      .insert({
        id: backupId,
        status: 'pending',
        tables: config.tables,
        created_at: new Date().toISOString()
      })
  }

  async updateBackupMetadata(backupId, updates) {
    await this.supabase
      .from('backup_metadata')
      .update(updates)
      .eq('id', backupId)
  }

  async exportData() {
    console.log('📊 Exporting database data...')
    const backupData = {}
    
    for (const table of config.tables) {
      try {
        console.log(`  📋 Exporting ${table}...`)
        
        const { data, error } = await this.supabase
          .from(table)
          .select('*')
        
        if (error) {
          console.warn(`⚠️  Warning: Failed to export ${table}: ${error.message}`)
          backupData[table] = []
        } else {
          backupData[table] = data || []
          console.log(`  ✅ Exported ${data?.length || 0} records from ${table}`)
        }
      } catch (error) {
        console.warn(`⚠️  Warning: Error exporting ${table}:`, error.message)
        backupData[table] = []
      }
    }
    
    return backupData
  }

  async processBackupData(backupId, data) {
    console.log('🔄 Processing backup data...')
    
    const jsonData = JSON.stringify(data, null, 2)
    const backupFile = path.join(config.backupDir, `${backupId}.json`)
    
    // Write JSON data
    await fs.writeFile(backupFile, jsonData, 'utf8')
    
    // Compress
    const compressedFile = `${backupFile}.gz`
    execSync(`gzip -${config.compressionLevel} "${backupFile}"`)
    
    // Encrypt if key is provided
    if (config.encryptionKey) {
      const encryptedFile = `${compressedFile}.enc`
      execSync(`openssl enc -aes-256-cbc -salt -in "${compressedFile}" -out "${encryptedFile}" -k "${config.encryptionKey}"`)
      await fs.unlink(compressedFile)
      return encryptedFile
    }
    
    return compressedFile
  }

  async uploadToS3(filePath, backupId) {
    if (!config.s3Bucket) return
    
    console.log('☁️  Uploading to S3...')
    
    try {
      const fileName = path.basename(filePath)
      const s3Key = `streamax-backups/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${fileName}`
      
      // Use AWS CLI for upload (requires AWS CLI to be installed and configured)
      execSync(`aws s3 cp "${filePath}" "s3://${config.s3Bucket}/${s3Key}" --region ${config.s3Region}`)
      
      console.log(`✅ Uploaded to S3: s3://${config.s3Bucket}/${s3Key}`)
      
      // Update metadata with S3 location
      await this.updateBackupMetadata(backupId, {
        s3_bucket: config.s3Bucket,
        s3_key: s3Key
      })
      
    } catch (error) {
      console.warn('⚠️  S3 upload failed:', error.message)
    }
  }

  async calculateChecksum(filePath) {
    try {
      const output = execSync(`sha256sum "${filePath}"`).toString()
      return output.split(' ')[0]
    } catch (error) {
      console.warn('⚠️  Failed to calculate checksum:', error.message)
      return null
    }
  }

  async cleanupOldBackups() {
    console.log('🧹 Cleaning up old backups...')
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - config.retentionDays)
    
    const { data: oldBackups } = await this.supabase
      .from('backup_metadata')
      .select('id, file_path, s3_bucket, s3_key')
      .lt('created_at', cutoffDate.toISOString())
    
    if (!oldBackups || oldBackups.length === 0) {
      console.log('  ✅ No old backups to clean up')
      return
    }
    
    for (const backup of oldBackups) {
      try {
        // Delete local file
        if (backup.file_path) {
          try {
            await fs.unlink(backup.file_path)
            console.log(`  🗑️  Deleted local file: ${backup.file_path}`)
          } catch (error) {
            console.warn(`  ⚠️  Failed to delete local file: ${error.message}`)
          }
        }
        
        // Delete S3 file
        if (backup.s3_bucket && backup.s3_key) {
          try {
            execSync(`aws s3 rm "s3://${backup.s3_bucket}/${backup.s3_key}"`)
            console.log(`  🗑️  Deleted S3 file: s3://${backup.s3_bucket}/${backup.s3_key}`)
          } catch (error) {
            console.warn(`  ⚠️  Failed to delete S3 file: ${error.message}`)
          }
        }
        
      } catch (error) {
        console.warn(`  ⚠️  Error cleaning up backup ${backup.id}:`, error.message)
      }
    }
    
    // Delete metadata
    const backupIds = oldBackups.map(b => b.id)
    await this.supabase
      .from('backup_metadata')
      .delete()
      .in('id', backupIds)
    
    console.log(`  ✅ Cleaned up ${oldBackups.length} old backups`)
  }

  async verifyBackups() {
    console.log('🔍 Verifying backups...')
    
    const { data: backups } = await this.supabase
      .from('backup_metadata')
      .select('*')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (!backups || backups.length === 0) {
      console.log('  ℹ️  No backups to verify')
      return
    }
    
    for (const backup of backups) {
      try {
        console.log(`  🔍 Verifying backup ${backup.id}...`)
        
        // Check file exists
        if (backup.file_path) {
          try {
            const stats = await fs.stat(backup.file_path)
            console.log(`    ✅ Local file exists (${stats.size} bytes)`)
            
            // Verify checksum if available
            if (backup.checksum) {
              const currentChecksum = await this.calculateChecksum(backup.file_path)
              if (currentChecksum === backup.checksum) {
                console.log(`    ✅ Checksum verified`)
              } else {
                console.log(`    ❌ Checksum mismatch`)
              }
            }
          } catch (error) {
            console.log(`    ❌ Local file missing: ${error.message}`)
          }
        }
        
        // Check S3 file
        if (backup.s3_bucket && backup.s3_key) {
          try {
            execSync(`aws s3 ls "s3://${backup.s3_bucket}/${backup.s3_key}"`)
            console.log(`    ✅ S3 file exists`)
          } catch (error) {
            console.log(`    ❌ S3 file missing`)
          }
        }
        
      } catch (error) {
        console.log(`    ❌ Verification failed: ${error.message}`)
      }
    }
  }

  async restoreBackup(backupId) {
    console.log(`🔄 Restoring backup ${backupId}...`)
    
    const { data: backup } = await this.supabase
      .from('backup_metadata')
      .select('*')
      .eq('id', backupId)
      .single()
    
    if (!backup) {
      throw new Error(`Backup ${backupId} not found`)
    }
    
    if (backup.status !== 'completed') {
      throw new Error(`Backup ${backupId} is not in completed state`)
    }
    
    console.log('⚠️  WARNING: This will overwrite existing data!')
    console.log('🔄 Restore operation would continue here...')
    console.log('   (Implementation depends on specific restore requirements)')
  }

  async notifySuccess(backupId, duration) {
    if (!config.webhookUrl) return
    
    try {
      const payload = {
        status: 'success',
        backupId,
        duration,
        timestamp: new Date().toISOString(),
        message: `Backup ${backupId} completed successfully in ${duration}ms`
      }
      
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.warn('⚠️  Failed to send success notification:', error.message)
    }
  }

  async notifyFailure(error) {
    if (!config.webhookUrl) return
    
    try {
      const payload = {
        status: 'failure',
        error: error.message,
        timestamp: new Date().toISOString(),
        message: `Backup failed: ${error.message}`
      }
      
      await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (notifyError) {
      console.warn('⚠️  Failed to send failure notification:', notifyError.message)
    }
  }

  getArgValue(args, argName) {
    const index = args.indexOf(argName)
    return index !== -1 && index + 1 < args.length ? args[index + 1] : null
  }
}

// Run if called directly
if (require.main === module) {
  const scheduler = new BackupScheduler()
  scheduler.run()
}

module.exports = BackupScheduler