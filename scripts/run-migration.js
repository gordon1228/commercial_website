const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  console.warn('dotenv not available, using system environment variables');
}

/**
 * Database Migration Runner
 * Safely executes database schema migration in phases
 */

class MigrationRunner {
  constructor() {
    this.databaseUrl = process.env.DATABASE_URL;
    this.migrationsDir = path.join(__dirname, '..', 'migrations');
    this.backupDir = path.join(__dirname, '..', 'backups');
    
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Execute shell command with promise
   */
  execCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      console.log(`Executing: ${command}`);
      
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error: ${error.message}`);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.error(`Stderr: ${stderr}`);
        }
        
        if (stdout) {
          console.log(`Stdout: ${stdout}`);
        }
        
        resolve({ stdout, stderr });
      });
    });
  }

  /**
   * Create database backup
   */
  async createBackup() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup_${timestamp}.sql`);
    
    console.log('🔄 Creating database backup...');
    
    try {
      await this.execCommand(`pg_dump "${this.databaseUrl}" > "${backupFile}"`);
      console.log(`✅ Backup created: ${backupFile}`);
      return backupFile;
    } catch (error) {
      console.error('❌ Failed to create backup:', error.message);
      throw error;
    }
  }

  /**
   * Run SQL migration file
   */
  async runSQLFile(filePath, description) {
    console.log(`🔄 ${description}...`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${filePath}`);
    }
    
    try {
      await this.execCommand(`psql "${this.databaseUrl}" -f "${filePath}"`);
      console.log(`✅ ${description} completed successfully`);
    } catch (error) {
      console.error(`❌ ${description} failed:`, error.message);
      throw error;
    }
  }

  /**
   * Test database connection
   */
  async testConnection() {
    console.log('🔄 Testing database connection...');
    
    try {
      await this.execCommand(`psql "${this.databaseUrl}" -c "SELECT version();"`);
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  /**
   * Verify migration success
   */
  async verifyMigration() {
    console.log('🔄 Verifying migration...');
    
    const verificationQueries = [
      "SELECT COUNT(*) as user_count FROM users;",
      "SELECT COUNT(*) as vehicle_count FROM vehicles;",
      "SELECT COUNT(*) as spec_count FROM vehicle_specs;",
      "SELECT COUNT(*) as feature_count FROM vehicle_features;",
      "SELECT COUNT(*) as inquiry_count FROM inquiries;",
      "SELECT COUNT(*) as analytics_count FROM vehicle_analytics;",
      "SELECT DISTINCT category FROM vehicle_specs ORDER BY category;",
      "SELECT DISTINCT \"eventType\" FROM vehicle_analytics ORDER BY \"eventType\";"
    ];
    
    try {
      for (const query of verificationQueries) {
        console.log(`Running: ${query}`);
        await this.execCommand(`psql "${this.databaseUrl}" -c "${query}"`);
      }
      console.log('✅ Migration verification completed');
    } catch (error) {
      console.error('❌ Migration verification failed:', error.message);
      throw error;
    }
  }

  /**
   * Regenerate Prisma client
   */
  async regeneratePrismaClient() {
    console.log('🔄 Regenerating Prisma client...');
    
    try {
      // First introspect the database to update schema
      await this.execCommand('npx prisma db pull');
      console.log('✅ Database introspection completed');
      
      // Generate new client
      await this.execCommand('npx prisma generate');
      console.log('✅ Prisma client regenerated');
    } catch (error) {
      console.error('❌ Prisma client regeneration failed:', error.message);
      throw error;
    }
  }

  /**
   * Run complete migration process
   */
  async runMigration(options = {}) {
    const {
      skipBackup = false,
      skipVerification = false,
      phaseOnly = null
    } = options;

    console.log('🚀 Starting database migration...');
    console.log('=======================================');
    
    try {
      // Step 1: Test connection
      await this.testConnection();
      
      // Step 2: Create backup (unless skipped)
      let backupFile = null;
      if (!skipBackup) {
        backupFile = await this.createBackup();
      } else {
        console.log('⚠️  Backup skipped - proceeding without backup');
      }
      
      // Step 3: Run Phase 1 (Non-breaking additions)
      if (!phaseOnly || phaseOnly === 1) {
        const phase1File = path.join(this.migrationsDir, 'phase1_non_breaking_additions.sql');
        await this.runSQLFile(phase1File, 'Running Phase 1: Non-breaking additions');
      }
      
      // Step 4: Run Phase 2 (Data migration)
      if (!phaseOnly || phaseOnly === 2) {
        const phase2File = path.join(this.migrationsDir, 'phase2_data_migration.sql');
        await this.runSQLFile(phase2File, 'Running Phase 2: Data migration');
      }
      
      // Step 5: Verify migration (unless skipped)
      if (!skipVerification) {
        await this.verifyMigration();
      }
      
      // Step 6: Regenerate Prisma client
      await this.regeneratePrismaClient();
      
      console.log('=======================================');
      console.log('🎉 Migration completed successfully!');
      
      if (backupFile) {
        console.log(`📁 Backup saved to: ${backupFile}`);
      }
      
      console.log('');
      console.log('Next steps:');
      console.log('1. Test your application functionality');
      console.log('2. Update your application code to use new schema features');
      console.log('3. Deploy the updated application');
      
    } catch (error) {
      console.log('=======================================');
      console.error('💥 Migration failed!');
      console.error('Error:', error.message);
      
      if (backupFile) {
        console.log('');
        console.log('🔄 To rollback, run:');
        console.log(`psql "${this.databaseUrl}" < "${backupFile}"`);
      }
      
      process.exit(1);
    }
  }

  /**
   * Rollback to backup
   */
  async rollback(backupFile) {
    if (!fs.existsSync(backupFile)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }
    
    console.log('🔄 Rolling back database...');
    
    try {
      await this.execCommand(`psql "${this.databaseUrl}" < "${backupFile}"`);
      console.log('✅ Rollback completed successfully');
      
      // Regenerate Prisma client after rollback
      await this.regeneratePrismaClient();
      
    } catch (error) {
      console.error('❌ Rollback failed:', error.message);
      throw error;
    }
  }
}

/**
 * Command line interface
 */
async function main() {
  const args = process.argv.slice(2);
  const runner = new MigrationRunner();
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Database Migration Runner

Usage:
  node run-migration.js [options]

Options:
  --help, -h          Show this help message
  --skip-backup       Skip database backup (not recommended)
  --skip-verification Skip post-migration verification
  --phase=1           Run only Phase 1 (non-breaking additions)
  --phase=2           Run only Phase 2 (data migration)
  --rollback=file     Rollback using specified backup file
  --test-connection   Only test database connection

Examples:
  node run-migration.js                    # Full migration with backup
  node run-migration.js --skip-backup      # Migration without backup
  node run-migration.js --phase=1          # Only Phase 1
  node run-migration.js --rollback=backup_2024-01-15.sql
  node run-migration.js --test-connection  # Test connection only
      `);
      return;
    }
    
    if (args.includes('--test-connection')) {
      await runner.testConnection();
      return;
    }
    
    const rollbackFile = args.find(arg => arg.startsWith('--rollback='))?.split('=')[1];
    if (rollbackFile) {
      await runner.rollback(path.resolve(rollbackFile));
      return;
    }
    
    const options = {
      skipBackup: args.includes('--skip-backup'),
      skipVerification: args.includes('--skip-verification'),
      phaseOnly: (() => {
        const phaseArg = args.find(arg => arg.startsWith('--phase='));
        return phaseArg ? parseInt(phaseArg.split('=')[1]) : null;
      })()
    };
    
    await runner.runMigration(options);
    
  } catch (error) {
    console.error('💥 Migration runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = MigrationRunner;