const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (error) {
  console.warn('dotenv not available, using system environment variables');
}

class PrismaMigration {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async runSQLFile(filePath, description) {
    console.log(`🔄 ${description}...`);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`Migration file not found: ${filePath}`);
    }
    
    const sqlContent = fs.readFileSync(filePath, 'utf8');
    
    try {
      // Remove comments and split by semicolons
      const cleanedSQL = sqlContent
        .replace(/--.*$/gm, '') // Remove line comments
        .replace(/\/\*[\s\S]*?\*\//gm, '') // Remove block comments
        .trim();
      
      const statements = cleanedSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement) {
          try {
            await this.prisma.$executeRawUnsafe(statement + ';');
            console.log(`   ✓ Statement ${i + 1}/${statements.length} executed`);
          } catch (error) {
            // Check if it's an "already exists" error which we can ignore
            if (error.message.includes('already exists') || 
                error.message.includes('column already exists') ||
                error.message.includes('relation already exists')) {
              console.log(`   ⚠ Statement ${i + 1}/${statements.length} skipped (already exists)`);
            } else {
              throw error;
            }
          }
        }
      }
      
      console.log(`✅ ${description} completed successfully`);
    } catch (error) {
      console.error(`❌ ${description} failed:`, error.message);
      throw error;
    }
  }

  async runPhase1Migration() {
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    
    // Run Phase 1 in separate steps to handle errors better
    try {
      // Step 1: Add columns to existing tables
      await this.runSQLFile(
        path.join(migrationsDir, 'phase1_prisma_compatible.sql'),
        'Phase 1A: Adding new columns'
      );
      
      // Step 2: Create new tables
      await this.runSQLFile(
        path.join(migrationsDir, 'phase1_create_tables.sql'),
        'Phase 1B: Creating new tables'
      );
      
      // Step 3: Add foreign keys and constraints
      await this.runSQLFile(
        path.join(migrationsDir, 'phase1_add_constraints.sql'),
        'Phase 1C: Adding constraints and indexes'
      );
      
    } catch (error) {
      console.error('Phase 1 migration failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    console.log('🔄 Testing database connection...');
    
    try {
      await this.prisma.$connect();
      const result = await this.prisma.$queryRaw`SELECT 1 as test`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  async verifyMigration() {
    console.log('🔄 Verifying migration...');
    
    try {
      // Check if new tables exist
      const vehicleSpecs = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'vehicle_specs'
      `;
      
      const vehicleFeatures = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'vehicle_features'
      `;
      
      const inquiryHistory = await this.prisma.$queryRaw`
        SELECT COUNT(*) as count FROM information_schema.tables 
        WHERE table_name = 'inquiry_history'
      `;

      console.log('✅ New tables verification:');
      console.log(`   vehicle_specs: ${vehicleSpecs[0].count > 0 ? 'EXISTS' : 'MISSING'}`);
      console.log(`   vehicle_features: ${vehicleFeatures[0].count > 0 ? 'EXISTS' : 'MISSING'}`);
      console.log(`   inquiry_history: ${inquiryHistory[0].count > 0 ? 'EXISTS' : 'MISSING'}`);
      
      // Check data migration results
      try {
        const specCount = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM vehicle_specs`;
        const featureCount = await this.prisma.$queryRaw`SELECT COUNT(*) as count FROM vehicle_features`;
        
        console.log('📊 Migration data results:');
        console.log(`   Migrated specs: ${specCount[0].count}`);
        console.log(`   Migrated features: ${featureCount[0].count}`);
      } catch (error) {
        console.log('⚠️  Data verification skipped (tables may not have data yet)');
      }
      
      console.log('✅ Migration verification completed');
    } catch (error) {
      console.error('❌ Migration verification failed:', error.message);
      throw error;
    }
  }

  async runMigration(options = {}) {
    const { phaseOnly = null } = options;
    
    console.log('🚀 Starting database migration with Prisma...');
    console.log('=======================================');
    
    try {
      // Test connection
      const connected = await this.testConnection();
      if (!connected) {
        throw new Error('Database connection failed');
      }
      
      // Run Phase 1 (Non-breaking additions)
      if (!phaseOnly || phaseOnly === 1) {
        await this.runPhase1Migration();
      }
      
      // Run Phase 2 (Data migration)
      if (!phaseOnly || phaseOnly === 2) {
        const phase2File = path.join(__dirname, '..', 'migrations', 'phase2_simple_migration.sql');
        await this.runSQLFile(phase2File, 'Running Phase 2: Data migration');
      }
      
      // Verify migration
      await this.verifyMigration();
      
      console.log('=======================================');
      console.log('🎉 Migration completed successfully!');
      console.log('');
      console.log('⚠️  Important: Run `npx prisma db pull && npx prisma generate` to update your Prisma schema');
      
    } catch (error) {
      console.log('=======================================');
      console.error('💥 Migration failed!');
      console.error('Error:', error.message);
      process.exit(1);
    } finally {
      await this.prisma.$disconnect();
    }
  }
}

// Command line interface
async function main() {
  const args = process.argv.slice(2);
  const migration = new PrismaMigration();
  
  try {
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
Prisma Database Migration Runner

Usage:
  node prisma-migration.js [options]

Options:
  --help, -h          Show this help message
  --phase=1           Run only Phase 1 (non-breaking additions)
  --phase=2           Run only Phase 2 (data migration)
  --test-connection   Only test database connection

Examples:
  node prisma-migration.js                    # Full migration
  node prisma-migration.js --phase=1          # Only Phase 1
  node prisma-migration.js --test-connection  # Test connection only
      `);
      return;
    }
    
    if (args.includes('--test-connection')) {
      await migration.testConnection();
      await migration.prisma.$disconnect();
      return;
    }
    
    const options = {
      phaseOnly: (() => {
        const phaseArg = args.find(arg => arg.startsWith('--phase='));
        return phaseArg ? parseInt(phaseArg.split('=')[1]) : null;
      })()
    };
    
    await migration.runMigration(options);
    
  } catch (error) {
    console.error('💥 Migration runner failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = PrismaMigration;