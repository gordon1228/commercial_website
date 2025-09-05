const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addPerformanceIndexes() {
  try {
    console.log('🔄 Phase 4: Adding performance indexes...')
    
    // Add indexes for frequently queried fields
    console.log('📈 Adding database indexes for optimal performance...')
    
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
          -- Sessions table indexes for session cleanup and user lookup
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessions_expires_at') THEN
              CREATE INDEX idx_sessions_expires_at ON sessions(expiresAt);
              RAISE NOTICE 'Created index on sessions.expiresAt';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessions_user_id') THEN
              CREATE INDEX idx_sessions_user_id ON sessions(userId);
              RAISE NOTICE 'Created index on sessions.userId';
          END IF;
          
          -- Vehicles table indexes for filtering and searching
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicles_status') THEN
              CREATE INDEX idx_vehicles_status ON vehicles(status);
              RAISE NOTICE 'Created index on vehicles.status';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicles_category_id') THEN
              CREATE INDEX idx_vehicles_category_id ON vehicles(categoryId);
              RAISE NOTICE 'Created index on vehicles.categoryId';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicles_active') THEN
              CREATE INDEX idx_vehicles_active ON vehicles(active);
              RAISE NOTICE 'Created index on vehicles.active';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicles_featured') THEN
              CREATE INDEX idx_vehicles_featured ON vehicles(featured);
              RAISE NOTICE 'Created index on vehicles.featured';
          END IF;
          
          -- Categories table indexes
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_categories_active') THEN
              CREATE INDEX idx_categories_active ON categories(active);
              RAISE NOTICE 'Created index on categories.active';
          END IF;
          
          -- Inquiries table indexes for status filtering
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inquiries_status') THEN
              CREATE INDEX idx_inquiries_status ON inquiries(status);
              RAISE NOTICE 'Created index on inquiries.status';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_inquiries_vehicle_id') THEN
              CREATE INDEX idx_inquiries_vehicle_id ON inquiries(vehicleId);
              RAISE NOTICE 'Created index on inquiries.vehicleId';
          END IF;
          
          -- Company values, team members, and certifications for ordering
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_company_values_order_active') THEN
              CREATE INDEX idx_company_values_order_active ON company_values("order", active);
              RAISE NOTICE 'Created index on company_values.order, active';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_team_members_order_active') THEN
              CREATE INDEX idx_team_members_order_active ON team_members("order", active);
              RAISE NOTICE 'Created index on team_members.order, active';
          END IF;
          
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_certifications_order_active') THEN
              CREATE INDEX idx_certifications_order_active ON certifications("order", active);
              RAISE NOTICE 'Created index on certifications.order, active';
          END IF;
          
          -- Partners table index
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_partners_order_active') THEN
              CREATE INDEX idx_partners_order_active ON partners("order", active);
              RAISE NOTICE 'Created index on partners.order, active';
          END IF;
          
          -- Composite indexes for common query patterns
          IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicles_status_active_category') THEN
              CREATE INDEX idx_vehicles_status_active_category ON vehicles(status, active, categoryId);
              RAISE NOTICE 'Created composite index on vehicles(status, active, categoryId)';
          END IF;
          
          RAISE NOTICE 'All performance indexes created successfully!';
      END $$;
    `
    
    // Show current indexes
    console.log('🔍 Verifying created indexes...')
    const indexes = await prisma.$queryRaw`
      SELECT 
          schemaname,
          tablename,
          indexname,
          indexdef
      FROM pg_indexes 
      WHERE tablename IN ('sessions', 'vehicles', 'categories', 'inquiries', 'company_values', 'team_members', 'certifications', 'partners')
        AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `
    
    console.log('📊 Created performance indexes:')
    indexes.forEach(idx => {
      console.log(`   - ${idx.tablename}.${idx.indexname}`)
    })
    
    console.log('✅ Phase 4 - Performance indexes added successfully!')
    
  } catch (error) {
    console.error('❌ Error in Phase 4:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run index creation if called directly
if (require.main === module) {
  addPerformanceIndexes()
    .then(() => {
      console.log('🎉 Phase 4 performance optimization completed successfully!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Phase 4 failed:', error)
      process.exit(1)
    })
}

module.exports = { addPerformanceIndexes }